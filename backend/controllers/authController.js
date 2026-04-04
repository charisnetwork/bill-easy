const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User, Company, Plan, Subscription, UserCompany } = require('../models');

// Helper function to mask email
const maskEmail = (email) => {
  const [localPart, domain] = email.split('@');
  const maskedLocal = localPart.charAt(0) + '***';
  return `${maskedLocal}@${domain}`;
};

/* ===============================
   REGISTER
================================ */
const register = async (req, res) => {
  try {
    console.log('Registration request body:', { ...req.body, password: '***' });
    const { companyName, email, password, name, phone, gstNumber, address } = req.body;

    // Check existing email
    const existingUserByEmail = await User.findOne({ where: { email } });
    if (existingUserByEmail) {
      return res.status(400).json({ 
        error: 'ACCOUNT_EXISTS',
        message: 'An account with this email already exists',
        maskedEmail: maskEmail(existingUserByEmail.email)
      });
    }

    // Check existing mobile number
    if (phone) {
      const existingUserByPhone = await User.findOne({ where: { phone } });
      if (existingUserByPhone) {
        return res.status(400).json({ 
          error: 'ACCOUNT_EXISTS',
          message: 'An account with this mobile number already exists',
          maskedEmail: maskEmail(existingUserByPhone.email)
        });
      }
    }

    console.log('Creating company with GST:', gstNumber);
    // Create company
    const company = await Company.create({
      name: companyName,
      gst_number: gstNumber,
      gst_registered: !!gstNumber,
      address: address,
      email: email
    });
    console.log('Company created:', company.id, 'GST saved:', company.gst_number);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      company_id: company.id,
      email,
      password: hashedPassword,
      name,
      phone,
      role: 'owner'
    });

    // Create UserCompany association
    await UserCompany.create({
      user_id: user.id,
      company_id: company.id,
      role: 'owner'
    });

    // Find or create Free plan
    let freePlan = await Plan.findOne({ where: { plan_name: 'Free Account' } });

    if (!freePlan) {
      freePlan = await Plan.create({
        plan_name: 'Free Account',
        price: 0,
        billing_cycle: 'lifetime',
        max_users: 1,
        max_invoices_per_month: 50,
        max_products: 100,
        features: {
          gst_billing: true,
          inventory_management: true,
          reports: true,
          quotations: true,
          eway_bills: false,
          multi_godowns: false,
          staff_attendance_payroll: false,
          manage_businesses: 1,
          user_activity_tracker: false
        },
        is_active: true
      });
    }

    // Create trial subscription
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 14);

    await Subscription.create({
      company_id: company.id,
      plan_id: freePlan.id,
      start_date: new Date(),
      expiry_date: trialEnd,
      status: 'trial',
      payment_status: 'pending',
      usage: {
        invoices: 0,
        products: 0,
        eway_bills: 0,
        godowns: 0
      }
    });

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, companyId: company.id },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
      }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      company: {
        id: company.id,
        name: company.name
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};


/* ===============================
   LOGIN
================================ */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      where: { email },
      include: [
        {
          model: Company,
          include: [{ model: Subscription, include: [Plan] }]
        }
      ]
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.is_active) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Fetch all companies this user has access to
    const userCompanies = await UserCompany.findAll({
      where: { user_id: user.id },
      include: [{ model: Company }]
    });

    const companies = userCompanies.map(uc => ({
      id: uc.Company.id,
      name: uc.Company.name,
      role: uc.role
    }));

    // Find the best plan across all these companies to determine overall account limits
    const companyIds = userCompanies.filter(uc => uc.role === 'owner').map(uc => uc.company_id);
    let maxBusinesses = 1;
    
    if (companyIds.length > 0) {
      const allSubs = await Subscription.findAll({
        where: { company_id: companyIds },
        include: [Plan]
      });
      allSubs.forEach(sub => {
        const limit = sub.Plan?.features?.manage_businesses || 1;
        if (limit > maxBusinesses) maxBusinesses = limit;
      });
    }

    // Update last login
    await user.update({ last_login: new Date() });

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, companyId: user.company_id },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
      }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions
      },
      maxBusinesses,
      company: user.Company ? {
        id: user.Company.id,
        name: user.Company.name,
        logo: user.Company.logo,
        currency: user.Company.currency
      } : null,
      companies,
      subscription: (user.Company && user.Company.Subscription)
        ? {
            plan: user.Company.Subscription.Plan,
            status: user.Company.Subscription.status,
            expiryDate: user.Company.Subscription.expiry_date,
            usage: user.Company.Subscription.usage
          }
        : null
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};


/* ===============================
   GET PROFILE
================================ */
const getProfile = async (req, res) => {
  try {
    const user = req.user;

    // Fetch all companies this user has access to
    const userCompanies = await UserCompany.findAll({
      where: { user_id: user.id },
      include: [{ model: Company }]
    });

    const companies = userCompanies.map(uc => ({
      id: uc.Company.id,
      name: uc.Company.name,
      role: uc.role
    }));

    // Find the best plan across all these companies to determine overall account limits
    const companyIds = userCompanies.filter(uc => uc.role === 'owner').map(uc => uc.company_id);
    let maxBusinesses = 1;
    
    if (companyIds.length > 0) {
      const allSubs = await Subscription.findAll({
        where: { company_id: companyIds },
        include: [Plan]
      });
      allSubs.forEach(sub => {
        const limit = sub.Plan?.features?.manage_businesses || 1;
        if (limit > maxBusinesses) maxBusinesses = limit;
      });
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        permissions: user.permissions
      },
      maxBusinesses,
      company: user.Company ? {
        id: user.Company.id,
        name: user.Company.name,
        gst_number: user.Company.gst_number,
        address: user.Company.address,
        city: user.Company.city,
        state: user.Company.state,
        pincode: user.Company.pincode,
        phone: user.Company.phone,
        email: user.Company.email,
        logo: user.Company.logo,
        signature: user.Company.signature,
        qr_code: user.Company.qr_code,
        tagline: user.Company.tagline,
        business_category: user.Company.business_category,
        invoice_prefix: user.Company.invoice_prefix,
        currency: user.Company.currency,
        bank_name: user.Company.bank_name,
        account_number: user.Company.account_number,
        ifsc_code: user.Company.ifsc_code,
        branch_name: user.Company.branch_name,
        terms_conditions: user.Company.terms_conditions,
        settings: user.Company.settings
      } : null,
      companies,
      subscription: (user.Company && user.Company.Subscription)
        ? {
            plan: user.Company.Subscription.Plan,
            status: user.Company.Subscription.status,
            expiryDate: user.Company.Subscription.expiry_date,
            usage: user.Company.Subscription.usage
          }
        : null
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
};


/* ===============================
   UPDATE PROFILE
================================ */
const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;

    await req.user.update({
      name,
      phone
    });

    res.json({ message: 'Profile updated successfully' });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};


/* ===============================
   CHANGE PASSWORD
================================ */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const validPassword = await bcrypt.compare(
      currentPassword,
      req.user.password
    );

    if (!validPassword) {
      return res.status(400).json({
        error: 'Current password is incorrect'
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await req.user.update({
      password: hashedPassword
    });

    res.json({ message: 'Password changed successfully' });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
};

const switchCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    
    // Verify user has access to this company
    const hasAccess = await UserCompany.findOne({
      where: { user_id: req.user.id, company_id: companyId }
    });

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied to this company' });
    }

    await req.user.update({ company_id: companyId });

    res.json({ message: 'Switched company successfully' });
  } catch (error) {
    console.error('Switch company error:', error);
    res.status(500).json({ error: 'Failed to switch company' });
  }
};


/* ===============================
   REQUEST PASSWORD RESET (OTP)
================================ */
const resetRequests = new Map(); // Store OTPs temporarily (in production use Redis)

const requestReset = async (req, res) => {
  try {
    const { email, phone } = req.body;
    
    if (!email && !phone) {
      return res.status(400).json({ error: 'Email or phone number required' });
    }

    // Find user by email or phone
    const user = await User.findOne({
      where: email ? { email } : { phone }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Store OTP and token (expires in 10 minutes)
    const expiresAt = Date.now() + 10 * 60 * 1000;
    resetRequests.set(resetToken, {
      userId: user.id,
      otp,
      expiresAt,
      email: user.email,
      phone: user.phone
    });

    // In production, send email or SMS here
    console.log(`🔐 Password Reset OTP for ${user.email}: ${otp}`);

    res.json({
      message: 'OTP sent successfully',
      resetToken,
      // In development only - remove in production
      debugOtp: process.env.NODE_ENV !== 'production' ? otp : undefined,
      maskedEmail: maskEmail(user.email),
      maskedPhone: user.phone ? `${user.phone.slice(0, 4)}****${user.phone.slice(-2)}` : null
    });

  } catch (error) {
    console.error('Request reset error:', error);
    res.status(500).json({ error: 'Failed to process reset request' });
  }
};

/* ===============================
   VERIFY OTP & RESET PASSWORD
================================ */
const verifyReset = async (req, res) => {
  try {
    const { resetToken, otp, newPassword } = req.body;

    const resetData = resetRequests.get(resetToken);
    
    if (!resetData) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    if (Date.now() > resetData.expiresAt) {
      resetRequests.delete(resetToken);
      return res.status(400).json({ error: 'OTP expired' });
    }

    if (resetData.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    // Update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.update(
      { password: hashedPassword },
      { where: { id: resetData.userId } }
    );

    // Clear reset request
    resetRequests.delete(resetToken);

    res.json({ message: 'Password reset successful' });

  } catch (error) {
    console.error('Verify reset error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
};


module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  switchCompany,
  requestReset,
  verifyReset
};
