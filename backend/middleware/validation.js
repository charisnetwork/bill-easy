const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Never echo submitted values (passwords included): field names and messages only.
    const list = errors.array().map((e) => ({ field: e.path, msg: e.msg }));
    return res.status(400).json({ error: list[0].msg, errors: list });
  }
  next();
};

const registerValidation = [
  body('companyName').trim().notEmpty().isString().withMessage('Company name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body().custom((_, { req }) => {
    const mobile = String(req.body.phone ?? req.body.mobileNumber ?? '').trim();
    if (!/^\+?[1-9]\d{9,14}$/.test(mobile)) throw new Error('Valid mobile number is required');
    req.body.phone = mobile;
    return true;
  }),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[\W_]/).withMessage('Password must contain at least one special character'),
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('countryCode').optional().matches(/^[A-Za-z]{2}$/).withMessage('Country code must be ISO alpha-2'),
  body('pincode').optional({ checkFalsy: true }).isString().matches(/^[A-Za-z0-9 -]{3,12}$/).withMessage('Invalid postal code'),
  handleValidationErrors
];

// Owner/admin adding a team member: same password rule as sign-up; never an owner account.
const memberValidation = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[\W_]/).withMessage('Password must contain at least one special character'),
  body('role').optional().isIn(['admin', 'staff']).withMessage('Role must be Admin or Staff'),
  handleValidationErrors
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

const customerValidation = [
  body('name').trim().notEmpty().withMessage('Customer name is required'),
  handleValidationErrors
];

const productValidation = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('purchase_price').isNumeric().withMessage('Purchase price must be a number'),
  body('sale_price').isNumeric().withMessage('Sale price must be a number'),
  body('stock_quantity').optional().isNumeric().withMessage('Stock quantity must be a number'),
  body('low_stock_alert').optional().isNumeric().withMessage('Low stock alert must be a number'),
  handleValidationErrors
];

const invoiceValidation = [
  body('customer_id').notEmpty().withMessage('Customer is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  handleValidationErrors
];

module.exports = {
  memberValidation,
  handleValidationErrors,
  registerValidation,
  loginValidation,
  customerValidation,
  productValidation,
  invoiceValidation
};
