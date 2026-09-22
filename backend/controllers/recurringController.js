const { RecurringSubscription, RecurringSubscriptionItem, Customer, Product, sequelize } = require('../models');
const { processSubscription } = require('../services/recurringInvoiceScheduler');
const { Op } = require('sequelize');

const getRecurringSubscriptions = async (req, res) => {
  try {
    const { search, status } = req.query;
    const where = { company_id: req.companyId };

    if (status) where.status = status;

    if (search) {
      where[Op.or] = [
        { profile_name: { [Op.iLike]: `%${search}%` } },
        { '$Customer.name$': { [Op.iLike]: `%${search}%` } }
      ];
    }

    const subscriptions = await RecurringSubscription.findAll({
      where,
      include: [
        { model: Customer, attributes: ['id', 'name', 'phone', 'email'] },
        { model: RecurringSubscriptionItem, as: 'items', include: [Product] }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json(subscriptions);
  } catch (error) {
    console.error('Get recurring subscriptions error:', error);
    res.status(500).json({ error: 'Failed to fetch recurring subscriptions' });
  }
};

const getRecurringSubscriptionById = async (req, res) => {
  try {
    const subscription = await RecurringSubscription.findOne({
      where: { id: req.params.id, company_id: req.companyId },
      include: [
        { model: Customer },
        { model: RecurringSubscriptionItem, as: 'items', include: [Product] }
      ]
    });

    if (!subscription) {
      return res.status(404).json({ error: 'Recurring subscription not found' });
    }

    res.json(subscription);
  } catch (error) {
    console.error('Get recurring subscription error:', error);
    res.status(500).json({ error: 'Failed to fetch recurring subscription' });
  }
};

const createRecurringSubscription = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const {
      customer_id,
      profile_name,
      frequency = 'monthly',
      billing_interval = 1,
      start_date,
      end_date,
      next_issue_date,
      auto_send_email = true,
      auto_send_whatsapp = false,
      notes,
      terms,
      items = []
    } = req.body;

    if (!customer_id || !profile_name) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Customer and profile name are required' });
    }

    if (!items.length) {
      await transaction.rollback();
      return res.status(400).json({ error: 'At least one line item is required' });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const initialIssueDate = next_issue_date || start_date || todayStr;

    const subscription = await RecurringSubscription.create({
      company_id: req.companyId,
      customer_id,
      profile_name,
      frequency,
      billing_interval,
      start_date: start_date || todayStr,
      end_date: end_date || null,
      next_issue_date: initialIssueDate,
      status: 'active',
      auto_send_email,
      auto_send_whatsapp,
      notes,
      terms
    }, { transaction });

    for (const item of items) {
      await RecurringSubscriptionItem.create({
        recurring_subscription_id: subscription.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount: item.discount || 0,
        tax_rate: item.tax_rate || 0,
        description: item.description || ''
      }, { transaction });
    }

    await transaction.commit();

    const created = await RecurringSubscription.findByPk(subscription.id, {
      include: [
        { model: Customer },
        { model: RecurringSubscriptionItem, as: 'items', include: [Product] }
      ]
    });

    res.status(201).json(created);
  } catch (error) {
    await transaction.rollback();
    console.error('Create recurring subscription error:', error);
    res.status(500).json({ error: 'Failed to create recurring subscription' });
  }
};

const updateRecurringSubscription = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const subscription = await RecurringSubscription.findOne({
      where: { id: req.params.id, company_id: req.companyId },
      transaction
    });

    if (!subscription) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Recurring subscription not found' });
    }

    const {
      customer_id,
      profile_name,
      frequency,
      billing_interval,
      start_date,
      end_date,
      next_issue_date,
      status,
      auto_send_email,
      auto_send_whatsapp,
      notes,
      terms,
      items
    } = req.body;

    await subscription.update({
      customer_id: customer_id || subscription.customer_id,
      profile_name: profile_name || subscription.profile_name,
      frequency: frequency || subscription.frequency,
      billing_interval: billing_interval !== undefined ? billing_interval : subscription.billing_interval,
      start_date: start_date || subscription.start_date,
      end_date: end_date !== undefined ? end_date : subscription.end_date,
      next_issue_date: next_issue_date || subscription.next_issue_date,
      status: status || subscription.status,
      auto_send_email: auto_send_email !== undefined ? auto_send_email : subscription.auto_send_email,
      auto_send_whatsapp: auto_send_whatsapp !== undefined ? auto_send_whatsapp : subscription.auto_send_whatsapp,
      notes: notes !== undefined ? notes : subscription.notes,
      terms: terms !== undefined ? terms : subscription.terms
    }, { transaction });

    if (Array.isArray(items)) {
      await RecurringSubscriptionItem.destroy({
        where: { recurring_subscription_id: subscription.id },
        transaction
      });

      for (const item of items) {
        await RecurringSubscriptionItem.create({
          recurring_subscription_id: subscription.id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount: item.discount || 0,
          tax_rate: item.tax_rate || 0,
          description: item.description || ''
        }, { transaction });
      }
    }

    await transaction.commit();

    const updated = await RecurringSubscription.findByPk(subscription.id, {
      include: [
        { model: Customer },
        { model: RecurringSubscriptionItem, as: 'items', include: [Product] }
      ]
    });

    res.json(updated);
  } catch (error) {
    await transaction.rollback();
    console.error('Update recurring subscription error:', error);
    res.status(500).json({ error: 'Failed to update recurring subscription' });
  }
};

const toggleStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'active', 'paused', 'cancelled'
    const subscription = await RecurringSubscription.findOne({
      where: { id: req.params.id, company_id: req.companyId }
    });

    if (!subscription) {
      return res.status(404).json({ error: 'Recurring subscription not found' });
    }

    const validStatuses = ['active', 'paused', 'cancelled'];
    const newStatus = status || (subscription.status === 'active' ? 'paused' : 'active');

    if (!validStatuses.includes(newStatus)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    await subscription.update({ status: newStatus });
    res.json({ message: `Subscription status updated to ${newStatus}`, subscription });
  } catch (error) {
    console.error('Toggle status error:', error);
    res.status(500).json({ error: 'Failed to update subscription status' });
  }
};

const triggerNow = async (req, res) => {
  try {
    const subscription = await RecurringSubscription.findOne({
      where: { id: req.params.id, company_id: req.companyId }
    });

    if (!subscription) {
      return res.status(404).json({ error: 'Recurring subscription not found' });
    }

    const invoice = await processSubscription(subscription);
    res.json({ message: 'Invoice generated successfully', invoice });
  } catch (error) {
    console.error('Trigger recurring now error:', error);
    res.status(500).json({ error: error.message || 'Failed to trigger recurring invoice' });
  }
};

const deleteRecurringSubscription = async (req, res) => {
  try {
    const subscription = await RecurringSubscription.findOne({
      where: { id: req.params.id, company_id: req.companyId }
    });

    if (!subscription) {
      return res.status(404).json({ error: 'Recurring subscription not found' });
    }

    await RecurringSubscriptionItem.destroy({ where: { recurring_subscription_id: subscription.id } });
    await subscription.destroy();

    res.json({ message: 'Recurring subscription deleted successfully' });
  } catch (error) {
    console.error('Delete recurring subscription error:', error);
    res.status(500).json({ error: 'Failed to delete recurring subscription' });
  }
};

module.exports = {
  getRecurringSubscriptions,
  getRecurringSubscriptionById,
  createRecurringSubscription,
  updateRecurringSubscription,
  toggleStatus,
  triggerNow,
  deleteRecurringSubscription
};
