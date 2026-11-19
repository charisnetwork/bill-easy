const { Expense } = require('../models');
const { Op } = require('sequelize');

const EXPENSE_CATEGORIES = [
  'Rent', 'Utilities', 'Salaries', 'Transportation', 'Office Supplies',
  'Marketing', 'Insurance', 'Maintenance', 'Professional Services',
  'Bank Charges', 'Taxes', 'Communication', 'Travel', 'Meals', 'Other'
];

const getExpenses = async (req, res) => {
  try {
    const { category, startDate, endDate, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const where = { company_id: req.companyId };

    if (category) {
      where.category = category;
    }

    if (startDate && endDate) {
      where.date = { [Op.between]: [new Date(startDate), new Date(endDate)] };
    }

    const { count, rows } = await Expense.findAndCountAll({
      where,
      order: [['date', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      expenses: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    // Error logged
    res.status(500).json({ error: 'Failed to get expenses' });
  }
};

const getExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      where: { id: req.params.id, company_id: req.companyId }
    });

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json(expense);
  } catch (error) {
    // Error logged
    res.status(500).json({ error: 'Failed to get expense' });
  }
};

// GST shown on the expense bill (part of amount): 0 when blank, never more than the amount.
function gstOf(body, amount) {
  if (body.gst_amount === undefined || body.gst_amount === null || body.gst_amount === '') return 0;
  const gst = Number(body.gst_amount);
  if (!Number.isFinite(gst) || gst < 0 || (amount !== undefined && gst > Number(amount))) {
    throw Object.assign(new Error('GST paid must be between 0 and the expense amount'), { status: 400 });
  }
  return Math.round(gst * 100) / 100;
}

const createExpense = async (req, res) => {
  try {
    const { category, amount, payment_method, date, notes, reference_number } = req.body;

    const expense = await Expense.create({
      company_id: req.companyId,
      category,
      amount,
      payment_method,
      date: date || new Date(),
      notes,
      reference_number,
      gst_amount: gstOf(req.body, amount)
    });

    res.status(201).json({ message: 'Expense created successfully', expense });
  } catch (error) {
    // Error logged
    if (error.status === 400) return res.status(400).json({ error: error.message });
    res.status(500).json({ error: 'Failed to create expense' });
  }
};

const updateExpense = async (req, res) => {
  try {
    const { category, amount, payment_method, date, notes, reference_number } = req.body;

    const expense = await Expense.findOne({
      where: { id: req.params.id, company_id: req.companyId }
    });

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    await expense.update({ category, amount, payment_method, date, notes, reference_number, ...(req.body.gst_amount !== undefined && { gst_amount: gstOf(req.body, amount ?? expense.amount) }) });
    res.json({ message: 'Expense updated successfully', expense });
  } catch (error) {
    // Error logged
    if (error.status === 400) return res.status(400).json({ error: error.message });
    res.status(500).json({ error: 'Failed to update expense' });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      where: { id: req.params.id, company_id: req.companyId }
    });

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    await expense.destroy();
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    // Error logged
    res.status(500).json({ error: 'Failed to delete expense' });
  }
};

const getExpenseCategories = async (req, res) => {
  res.json(EXPENSE_CATEGORIES);
};

module.exports = { getExpenses, getExpense, createExpense, updateExpense, deleteExpense, getExpenseCategories };
