const { InvoiceCounter, QuotationCounter, Company, sequelize } = require('../models');

const peekInvoiceNumber = async (companyId) => {
  try {
    const counter = await InvoiceCounter.findOne({
      where: { company_id: companyId }
    });
    
    const company = await Company.findByPk(companyId);
    const prefix = company?.invoice_prefix || "INV";
    const nextNumber = counter ? (counter.last_number + 1) : 1;
    
    console.log(`[peekInvoiceNumber] Company: ${companyId}, Next: ${nextNumber}`);
    return `${prefix}-${nextNumber}`;
  } catch (error) {
    console.error('Peek Invoice Number error:', error);
    return "INV-1";
  }
};

const generateInvoiceNumber = async (companyId, existingTransaction = null) => {
  const transaction = existingTransaction || await sequelize.transaction();
  try {
    let [counter, created] = await InvoiceCounter.findOrCreate({
      where: { company_id: companyId },
      defaults: { last_number: 0 },
      transaction,
      lock: true
    });

    // Use increment for atomicity
    await counter.increment('last_number', { by: 1, transaction });
    
    // Reload to get the fresh value
    await counter.reload({ transaction });

    const company = await Company.findByPk(companyId, { transaction });
    const prefix = company?.invoice_prefix || "INV";
    const invoiceNumber = `${prefix}-${counter.last_number}`;

    console.log(`[generateInvoiceNumber] Company: ${companyId}, New Number: ${invoiceNumber}`);

    if (!existingTransaction) {
      await transaction.commit();
    }
    return invoiceNumber;
  } catch (error) {
    if (!existingTransaction) {
      await transaction.rollback();
    }
    throw error;
  }
};

const peekQuotationNumber = async (companyId) => {
  try {
    const counter = await QuotationCounter.findOne({
      where: { company_id: companyId }
    });
    const nextNumber = counter ? (counter.last_number + 1) : 1;
    return `QTN-${nextNumber}`;
  } catch (error) {
    console.error('Peek Quotation Number error:', error);
    return "QTN-1";
  }
};

const generateQuotationNumber = async (companyId, existingTransaction = null) => {
  const transaction = existingTransaction || await sequelize.transaction();
  try {
    let [counter, created] = await QuotationCounter.findOrCreate({
      where: { company_id: companyId },
      defaults: { last_number: 0 },
      transaction,
      lock: true
    });

    await counter.increment('last_number', { by: 1, transaction });
    await counter.reload({ transaction });

    const quotationNumber = `QTN-${counter.last_number}`;
    
    console.log(`[generateQuotationNumber] Company: ${companyId}, New Number: ${quotationNumber}`);

    if (!existingTransaction) {
      await transaction.commit();
    }
    return quotationNumber;
  } catch (error) {
    if (!existingTransaction) {
      await transaction.rollback();
    }
    throw error;
  }
};

module.exports = {
  generateInvoiceNumber,
  generateQuotationNumber,
  peekInvoiceNumber,
  peekQuotationNumber
};
