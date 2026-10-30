const { Company, User, UserCompany, Godown } = require("../models");
const invoiceDesign = require("../services/invoiceDesign");
const { resolveIndustry, signupSettingsFor } = require("../config/industries");
const { ensureDefaultGodown } = require("../services/companySetup");
const bcrypt = require("bcryptjs");
const { Country } = require('country-state-city');
const charisOs = require("../services/charisOsService");

const currencyForCountry = (code) => Country.getCountryByCode(code)?.currency || null;


/* =========================================================
   GET COMPANY DETAILS
========================================================= */

const getCompany = async (req, res) => {
  try {

    const company = await Company.findByPk(req.companyId, {
      include: [
        {
          model: User,
          attributes: ["id", "name", "email", "role", "is_active"]
        }
      ]
    });

    res.json(company);

  } catch (error) {

    // Error logged

    res.status(500).json({
      error: "Failed to get company"
    });

  }
};


/* =========================================================
   UPDATE COMPANY
========================================================= */

const updateCompany = async (req, res) => {
  try {
    const {
      name,
      gst_number,
      address,
      city,
      state,
      pincode,
      country_code,
      language,
      phone,
      email,
      tagline,
      business_category,
      invoice_prefix,
      currency,
      bank_name,
      account_number,
      ifsc_code,
      branch_name,
      terms_conditions,
      settings
    } = req.body;

    const company = await Company.findByPk(req.companyId);
    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }

    // Merge settings instead of overwriting
    let newSettings = {
      ...(company.settings || {}),
      ...(settings || {})
    };

    // Invoice design changes are validated and checked against the Charis OS plan.
    if (invoiceDesign.isDesignUpdate(settings)) {
      let features = {};
      try { features = charisOs.summaryFromSnapshot(await charisOs.getSnapshot(req.companyId)).features; }
      catch { /* OS unreachable: only free templates can be newly chosen */ }
      const design = await invoiceDesign.validateInvoiceSettings(
        Object.fromEntries(invoiceDesign.DESIGN_KEYS.filter((k) => k in settings).map((k) => [k, settings[k]])),
        { features, current: company.settings || {} });
      const others = Object.fromEntries(Object.entries(settings).filter(([k]) => !invoiceDesign.DESIGN_KEYS.includes(k)));
      newSettings = invoiceDesign.mergeIntoCompanySettings({ ...(company.settings || {}), ...others }, design);
    }

    const normalizedCountry = country_code ? String(country_code).toUpperCase() : company.country_code || 'IN';
    const countryCurrency = currencyForCountry(normalizedCountry);
    if (!countryCurrency) {
      return res.status(400).json({ error: 'Unsupported country.' });
    }

    await company.update({
      name,
      gst_number,
      address,
      city,
      state,
      pincode,
      country_code: normalizedCountry,
      language,
      currency: countryCurrency,
      phone,
      email,
      tagline,
      business_category,
      invoice_prefix,
      currency,
      bank_name,
      account_number,
      ifsc_code,
      branch_name,
      terms_conditions,
      settings: newSettings
    });

    const updatedCompany = await Company.findByPk(req.companyId);

    res.json({
      message: "Company updated successfully",
      company: updatedCompany
    });

  } catch (error) {
    // Error logged
    res.status(500).json({ error: "Failed to update company" });
  }
};


/* =========================================================
   UPDATE COMPANY SETTINGS (PATCH)
========================================================= */

const updateSettings = async (req, res) => {
  try {
    const { settings, gst_number, gst_registered, enable_tds, enable_tcs } = req.body;
    
    const company = await Company.findByPk(req.companyId);
    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }

    let newSettings = {
      ...(company.settings || {}),
      ...(settings || {})
    };

    // Invoice design changes are validated and checked against the Charis OS plan.
    if (invoiceDesign.isDesignUpdate(settings)) {
      let features = {};
      try { features = charisOs.summaryFromSnapshot(await charisOs.getSnapshot(req.companyId)).features; }
      catch { /* OS unreachable: only free templates can be newly chosen */ }
      const design = await invoiceDesign.validateInvoiceSettings(
        Object.fromEntries(invoiceDesign.DESIGN_KEYS.filter((k) => k in settings).map((k) => [k, settings[k]])),
        { features, current: company.settings || {} });
      const others = Object.fromEntries(Object.entries(settings).filter(([k]) => !invoiceDesign.DESIGN_KEYS.includes(k)));
      newSettings = invoiceDesign.mergeIntoCompanySettings({ ...(company.settings || {}), ...others }, design);
    }

    const updateData = { settings: newSettings };
    
    // Handle top-level fields
    if (gst_registered !== undefined) updateData.gst_registered = gst_registered;
    if (enable_tds !== undefined) updateData.enable_tds = enable_tds;
    if (enable_tcs !== undefined) updateData.enable_tcs = enable_tcs;
    
    if (gst_registered === false) {
      updateData.gst_number = "";
    } else if (gst_number !== undefined) {
      updateData.gst_number = gst_number;
    }

    await company.update(updateData);
    const updatedCompany = await Company.findByPk(req.companyId);

    res.json({
      message: "Settings updated successfully",
      company: updatedCompany
    });

  } catch (error) {
    if (error instanceof invoiceDesign.DesignError) {
      return res.status(error.status).json({ error: error.message, code: error.code, feature: error.feature, upgradeRequired: error.status === 403 || undefined });
    }
    res.status(500).json({ error: "Failed to update settings" });
  }
};

/** Pro: AI suggests a template, colour and columns from the business type and logo colours. */
const suggestInvoiceDesign = async (req, res) => {
  try {
    const company = await Company.findByPk(req.companyId, { attributes: ['business_category', 'settings'] });
    const features = charisOs.summaryFromSnapshot(await charisOs.getSnapshot(req.companyId)).features;
    const industry = company?.settings?.invoice_industry_type || company?.business_category;
    res.json(await invoiceDesign.suggestDesign({ industry, logoColors: req.body?.logo_colors, features }));
  } catch (error) {
    if (error instanceof charisOs.CharisOsError) return res.status(error.status).json({ error: error.message, code: error.code });
    res.status(500).json({ error: 'Could not suggest a design right now' });
  }
};


const { removeCompanyAsset, saveCompanyAsset } = require("../utils/fileStore");

/* =========================================================
   UPLOAD COMPANY LOGO / SIGNATURE / QR CODE
   Stored on this server (utils/fileStore.js) under a random name; the old file is removed.
========================================================= */

const companyAssetUpload = (kind, field, label) => async (req, res) => {
  try {
    const companyId = req.companyId;
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const company = await Company.findByPk(companyId, { attributes: ["id", field] });
    if (!company) return res.status(404).json({ error: "Company not found" });
    const stored = await saveCompanyAsset(req.file.buffer, kind, req.file.mimetype);
    const previous = company[field];
    await Company.update({ [field]: stored }, { where: { id: companyId } });
    if (previous && previous !== stored) await removeCompanyAsset(previous).catch(() => {});
    res.json({ success: true, [field]: stored });
  } catch (err) {
    if (err.status === 400) return res.status(400).json({ error: err.message });
    console.error(`${label} upload failed`, err.message);
    res.status(500).json({ error: `${label} upload failed` });
  }
};

const uploadLogo = companyAssetUpload("logo", "logo", "Logo");
const uploadSignature = companyAssetUpload("signature", "signature", "Signature");
const uploadQRCode = companyAssetUpload("qrcode", "qr_code", "QR Code");


/* =========================================================
   GET COMPANY USERS
========================================================= */

const getUsers = async (req, res) => {

  try {

    const users = await User.findAll({
      where: { company_id: req.companyId },
      attributes: [
        "id",
        "name",
        "email",
        "mobile_number",
        "role",
        "permissions",
        "is_active",
        "last_login",
        "created_at"
      ]
    });

    res.json(users);

  } catch (error) {

    // Error logged

    res.status(500).json({
      error: "Failed to get users"
    });

  }

};


/* =========================================================
   ADD USER
========================================================= */

const addUser = async (req, res) => {

  try {

    const { name, email, password, phone, mobile_number, role, permissions } = req.body;
    const mobileNum = mobile_number || phone; // accept either field name from frontend

    const existingUser = await User.findOne({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        error: "Email already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12); // Consistent with authController (rounds=12)

    const user = await User.create({
      company_id: req.companyId,
      name,
      email,
      password: hashedPassword,
      mobile_number: mobileNum,
      role: role || "staff",
      permissions: permissions || {}
    });

    res.status(201).json({
      message: "User added successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {

    // Error logged

    res.status(500).json({
      error: "Failed to add user"
    });

  }

};


/* =========================================================
   UPDATE USER
========================================================= */

const updateUser = async (req, res) => {

  try {

    const { id } = req.params;

    const { name, phone, mobile_number, role, permissions, is_active } = req.body;
    const mobileNum = mobile_number || phone; // accept either field name from frontend

    const user = await User.findOne({
      where: {
        id,
        company_id: req.companyId
      }
    });

    if (!user) {
      return res.status(404).json({
        error: "User not found"
      });
    }

    await user.update({
      name,
      mobile_number: mobileNum,
      role,
      permissions,
      is_active
    });

    res.json({
      message: "User updated successfully"
    });

  } catch (error) {

    // Error logged

    res.status(500).json({
      error: "Failed to update user"
    });

  }

};


/* =========================================================
   DELETE USER
========================================================= */

const deleteUser = async (req, res) => {

  try {

    const { id } = req.params;

    if (id === req.user.id) {

      return res.status(400).json({
        error: "Cannot delete your own account"
      });

    }

    const user = await User.findOne({
      where: {
        id,
        company_id: req.companyId
      }
    });

    if (!user) {

      return res.status(404).json({
        error: "User not found"
      });

    }

    if (user.role === "owner") {

      return res.status(400).json({
        error: "Cannot delete owner account"
      });

    }

    await user.destroy();

    res.json({
      message: "User deleted successfully"
    });

  } catch (error) {

    // Error logged

    res.status(500).json({
      error: "Failed to delete user"
    });

  }

};

/* =========================================================
   ADD ADDITIONAL BUSINESS (PLAN RESTRICTED)
========================================================= */

const addCompany = async (req, res) => {
  try {
    const { name, gst_number, address, city, state, pincode, phone, email, business_category } = req.body;
    const industry = business_category ? resolveIndustry(business_category) : 'General Store';
    if (!industry) return res.status(400).json({ error: 'Please choose your business type from the list.' });
    
    // 1. Count existing businesses owned by this user
    const userCompanies = await UserCompany.findAll({ 
      where: { user_id: req.user.id, role: 'owner' },
      attributes: ['company_id']
    });
    
    const companyIds = userCompanies.map(uc => uc.company_id);
    const currentCount = companyIds.length;

    // The owner's plan in Charis OS sets the business limit.
    let limit;
    try {
      limit = await charisOs.businessLimit(req.companyId);
    } catch (error) {
      if (error instanceof charisOs.CharisOsError) return res.status(error.status).json({ error: error.message, code: error.code, needsUpgrade: error.status === 403 });
      throw error;
    }
    if (currentCount >= limit) {
      return res.status(403).json({ error: `Business limit reached. Your plan allows a maximum of ${limit} businesses.`, code: 'QUOTA_EXCEEDED', feature: 'businesses', limit, used: currentCount, upgradeRequired: true, currentCount, maxLimit: limit, needsUpgrade: true });
    }

    // 4. Create new company
    const company = await Company.create({
      owner_id: req.user.id,
      name, gst_number, address, city, state, pincode, phone, email,
      business_category: industry,
      settings: signupSettingsFor(industry)
    });

    await ensureDefaultGodown(company);

    // 5. Link user as owner
    await UserCompany.create({
      user_id: req.user.id,
      company_id: company.id,
      role: 'owner'
    });

    res.status(201).json({ 
      message: 'New business created successfully', 
      company 
    });

  } catch (error) {
    // Error logged
    res.status(500).json({ error: process.env.NODE_ENV === 'production' ? 'Failed to create business' : 'Failed to create business: ' + error.message });
  }
};

/* =========================================================
   GODOWNS (PLAN RESTRICTED)
========================================================= */

const getGodowns = async (req, res) => {
  try {
    const godowns = await Godown.findAll({ where: { company_id: req.companyId } });
    res.json(godowns);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch godowns' });
  }
};

const addGodown = async (req, res) => {
  try {
    const { name, location } = req.body;
    const godown = await Godown.create({
      company_id: req.companyId,
      name,
      location
    });
    res.status(201).json(godown);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create godown' });
  }
};

/* =========================================================
   INVOICE CUSTOMIZATION
========================================================= */

const updateInvoiceCustomization = async (req, res) => {
  try {
    const { businessType, columnLabels, columnToggles, headerColor, menuColor, textSize } = req.body;

    const company = await Company.findByPk(req.companyId);
    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }

    // Update the customization fields
    await company.update({
      invoice_business_category: businessType,
      invoice_column_labels: columnLabels,
      invoice_column_toggles: columnToggles,
      invoice_header_color: headerColor,
      invoice_menu_color: menuColor,
      invoice_text_size: textSize
    });

    res.json({ message: 'Invoice settings updated successfully', settings: company });

  } catch (error) {
    // Error logged
    res.status(500).json({ error: process.env.NODE_ENV === 'production' ? 'Update failed' : 'Update failed: ' + error.message });
  }
};


/* =========================================================
   EXPORT CONTROLLER FUNCTIONS
========================================================= */

module.exports = {

  getCompany,
  suggestInvoiceDesign,
  updateCompany,
  updateSettings,

  uploadLogo,
  uploadSignature,
  uploadQRCode,

  getUsers,
  addUser,
  updateUser,
  deleteUser,
  addCompany,
  getGodowns,
  addGodown,
  updateInvoiceCustomization
  };
