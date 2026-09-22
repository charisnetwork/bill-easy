const { RecurringSubscription, RecurringSubscriptionItem, Invoice, InvoiceItem, Customer, Product, Godown, sequelize } = require('../models');
const { generateInvoiceNumber } = require('./invoiceNumberService');
const { sendEmailViaAPI } = require('../utils/mailer');
const { Op } = require('sequelize');

/**
 * Calculates the next billing issue date based on frequency & billing interval.
 */
function calculateNextDate(currentDateStr, frequency, interval = 1) {
  const date = new Date(currentDateStr);
  const n = parseInt(interval, 10) || 1;

  switch (frequency) {
    case 'weekly':
      date.setDate(date.getDate() + (7 * n));
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + n);
      break;
    case 'quarterly':
      date.setMonth(date.getMonth() + (3 * n));
      break;
    case 'annually':
      date.setFullYear(date.getFullYear() + n);
      break;
    default:
      date.setMonth(date.getMonth() + n);
  }
  return date.toISOString().split('T')[0];
}

/**
 * Generates an invoice for a specific recurring subscription profile.
 */
async function processSubscription(subscription, transaction = null) {
  const ownTransaction = !transaction;
  const tx = transaction || (await sequelize.transaction());

  try {
    const sub = await RecurringSubscription.findByPk(subscription.id, {
      include: [
        { model: RecurringSubscriptionItem, as: 'items', include: [Product] },
        { model: Customer }
      ],
      transaction: tx
    });

    if (!sub || sub.status !== 'active') {
      if (ownTransaction) await tx.rollback();
      return null;
    }

    // 1. Generate Invoice Number
    const invoiceNumber = await generateInvoiceNumber(sub.company_id, tx);

    // 2. Process Items and calculate totals
    let totalTax = 0;
    let totalAmount = 0;
    const invoiceItemsData = [];

    for (const item of sub.items) {
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.unit_price) || 0;
      const discount = parseFloat(item.discount) || 0;
      const taxRate = parseFloat(item.tax_rate) || 0;

      const itemSubtotal = (qty * price) - discount;
      const tax = (itemSubtotal * taxRate) / 100;
      const itemTotal = itemSubtotal + tax;

      totalTax += tax;
      totalAmount += itemTotal;

      invoiceItemsData.push({
        product_id: item.product_id,
        quantity: qty,
        unit_price: price,
        discount,
        tax_rate: taxRate,
        tax_amount: tax,
        total: itemTotal.toFixed(2),
        description: item.description
      });
    }

    const subtotal = totalAmount - totalTax;
    const todayStr = new Date().toISOString().split('T')[0];

    // 3. Create Invoice
    const invoice = await Invoice.create({
      company_id: sub.company_id,
      customer_id: sub.customer_id,
      godown_id: sub.godown_id || null,
      invoice_number: invoiceNumber,
      invoice_date: todayStr,
      due_date: todayStr,
      subtotal: subtotal.toFixed(2),
      tax_amount: totalTax.toFixed(2),
      total_amount: totalAmount.toFixed(2),
      final_amount: totalAmount.toFixed(2),
      paid_amount: 0,
      payment_status: 'unpaid',
      status: 'sent',
      notes: sub.notes || `Auto-generated from subscription: ${sub.profile_name}`,
      terms: sub.terms
    }, { transaction: tx });

    // 4. Create Invoice Items
    for (const itemData of invoiceItemsData) {
      await InvoiceItem.create({
        invoice_id: invoice.id,
        ...itemData
      }, { transaction: tx });
    }

    // 5. Update Customer Outstanding Balance
    if (sub.Customer) {
      await sub.Customer.increment('outstanding_balance', {
        by: totalAmount,
        transaction: tx
      });
    }

    // 6. Update Subscription next issue date & status
    const nextDate = calculateNextDate(todayStr, sub.frequency, sub.billing_interval);
    let newStatus = 'active';

    if (sub.end_date && new Date(nextDate) > new Date(sub.end_date)) {
      newStatus = 'completed';
    }

    await sub.update({
      last_issued_date: todayStr,
      next_issue_date: nextDate,
      status: newStatus
    }, { transaction: tx });

    if (ownTransaction) await tx.commit();

    // 7. Optional Email Dispatch
    if (sub.auto_send_email && sub.Customer && sub.Customer.email) {
      try {
        await sendEmailViaAPI(
          sub.Customer.email,
          `Invoice #${invoiceNumber} from your recurring subscription`,
          `<p>Dear ${sub.Customer.name},</p>
           <p>Your recurring invoice <strong>#${invoiceNumber}</strong> for <strong>₹${totalAmount.toFixed(2)}</strong> has been generated.</p>
           <p>Profile: ${sub.profile_name}</p>
           <p>Thank you for your business!</p>`
        );
      } catch (mailErr) {
        console.error(`[RecurringScheduler] Failed to send email for invoice #${invoiceNumber}:`, mailErr.message);
      }
    }

    return invoice;
  } catch (error) {
    if (ownTransaction) await tx.rollback();
    console.error(`[RecurringScheduler] Error processing subscription ID ${subscription.id}:`, error);
    throw error;
  }
}

/**
 * Checks all active subscriptions across companies and generates due invoices.
 */
async function processDueSubscriptions() {
  const todayStr = new Date().toISOString().split('T')[0];
  try {
    const dueSubscriptions = await RecurringSubscription.findAll({
      where: {
        status: 'active',
        next_issue_date: { [Op.lte]: todayStr }
      }
    });

    console.log(`[RecurringScheduler] Found ${dueSubscriptions.length} due subscription(s) to process.`);

    const generatedInvoices = [];
    for (const sub of dueSubscriptions) {
      try {
        const invoice = await processSubscription(sub);
        if (invoice) generatedInvoices.push(invoice);
      } catch (err) {
        console.error(`[RecurringScheduler] Error processing subscription ${sub.id}:`, err.message);
      }
    }

    return generatedInvoices;
  } catch (error) {
    console.error('[RecurringScheduler] Error fetching due subscriptions:', error);
    return [];
  }
}

/**
 * Starts the recurring invoice background scheduler (runs every 6 hours + once on startup).
 */
function startScheduler() {
  console.log('[RecurringScheduler] Recurring invoice scheduler initialized.');
  
  // Run check on server startup after short delay
  setTimeout(() => {
    processDueSubscriptions();
  }, 10000);

  // Repeat every 6 hours
  const SIX_HOURS = 6 * 60 * 60 * 1000;
  setInterval(() => {
    processDueSubscriptions();
  }, SIX_HOURS);
}

module.exports = {
  processSubscription,
  processDueSubscriptions,
  startScheduler
};
