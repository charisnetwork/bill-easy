const { UserCompany } = require("../models");

module.exports = async function (req, res, next) {
  try {
    // Check header first, then fallback to user's primary company
    let companyId = req.headers["x-company-id"] || req.user.company_id;

    console.log(`[CompanyContext] User: ${req.user.email}, Header CompanyID: ${req.headers["x-company-id"]}, User CompanyID: ${req.user.company_id}, Effective CompanyID: ${companyId}`);

    if (!companyId) {
      console.warn(`[CompanyContext] Company ID missing for user: ${req.user.email}`);
      return res.status(400).json({
        error: "Company ID missing"
      });
    }

    // Optional: Verify user actually belongs to this company if using header
    if (req.headers["x-company-id"]) {
      const access = await UserCompany.findOne({
        where: {
          user_id: req.user.id,
          company_id: companyId
        }
      });

      if (!access) {
        // Also check if they are the owner/admin of the company directly
        if (req.user.company_id !== companyId) {
          return res.status(403).json({
            error: "Company access denied"
          });
        }
      }
    }

    req.companyId = companyId;
    next();
  } catch (error) {
    console.error("Company context error:", error);
    res.status(500).json({ error: "Failed to verify company context" });
  }
};
