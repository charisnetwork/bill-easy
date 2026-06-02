const { Subscription, Plan, Invoice, Product, UserCompany, Godown } = require('../models');
const { Op } = require('sequelize');

const SubscriptionGuard = {
  /**
   * Core logic to check if a company can perform an action
   * @param {string} companyId - The UUID of the company
   * @param {string} actionType - The feature or action being requested
   * @returns {Promise<boolean>}
   */
  canPerformAction: async (companyId, actionType) => {
    try {
      const { Company } = require('../models');
      const targetCompany = await Company.findByPk(companyId);
      if (!targetCompany) return false;

      // Find owner_id (either directly or via UserCompany fallback)
      let ownerId = targetCompany.owner_id;
      if (!ownerId) {
        const uc = await UserCompany.findOne({ where: { company_id: companyId, role: 'owner' } });
        if (uc) ownerId = uc.user_id;
      }
      if (!ownerId) return false;

      // Find all companies owned by this user
      const ownedCompanies = await UserCompany.findAll({ where: { user_id: ownerId, role: 'owner' } });
      const ownedCompanyIds = ownedCompanies.map(uc => uc.company_id);

      // Find all subscriptions for these companies
      const subscriptions = await Subscription.findAll({
        where: { company_id: ownedCompanyIds },
        include: [Plan]
      });

      if (!subscriptions || subscriptions.length === 0) return false;

      let bestPlan = null;
      let highestLimit = -1;

      for (let sub of subscriptions) {
        let plan = sub.Plan;
        if (!plan) continue;
        
        // Global Expiry Check: If expired, downgrade to 'Free Account'
        if (sub.expiry_date && new Date() > new Date(sub.expiry_date) && plan.plan_name !== 'Free Account') {
          const freePlan = await Plan.findOne({ where: { plan_name: 'Free Account' } });
          if (freePlan) {
            await sub.update({
              plan_id: freePlan.id,
              status: 'active',
              expiry_date: null
            });
            plan = freePlan;
          }
        }

        let features = plan.features || {};
        if (typeof features === 'string') {
          try { features = JSON.parse(features); } catch(e) { features = {}; }
        }
        
        const limit = parseInt(features.manage_businesses) || 1;
        if (limit > highestLimit) {
          highestLimit = limit;
          bestPlan = plan;
        }
      }

      if (!bestPlan) return false;

      const plan = bestPlan;
      let features = plan.features || {};
      if (typeof features === 'string') {
        try { features = JSON.parse(features); } catch(e) { features = {}; }
      }
      const planName = plan.plan_name;

      switch (actionType) {
        case 'ADD_BUSINESS':
          const businessCount = ownedCompanyIds.length;
          const businessLimit = parseInt(features.manage_businesses) || 1;
          return businessCount < businessLimit;

        case 'CREATE_INVOICE':
          const startOfMonth = new Date();
          startOfMonth.setDate(1);
          startOfMonth.setHours(0, 0, 0, 0);
          const invoiceCount = await Invoice.count({
            where: { company_id: companyId, createdAt: { [Op.gte]: startOfMonth } }
          });
          const invLimit = plan.max_invoices_per_month || 50;
          return invoiceCount < invLimit;

        case 'ADD_PRODUCT':
          const productCount = await Product.count({ where: { company_id: companyId } });
          const prodLimit = plan.max_products || 100;
          return productCount < prodLimit;

        case 'EWAY_BILL':
          if (planName === 'Free Account') return false;
          if (planName === 'Premium') {
            const startOfM = new Date();
            startOfM.setDate(1);
            const ewayCount = await Invoice.count({
                where: { 
                    company_id: companyId, 
                    eway_bill_number: { [Op.ne]: null },
                    createdAt: { [Op.gte]: startOfM }
                }
            });
            return ewayCount < 5;
          }
          return features.eway_bills === true;

        case 'MULTI_GODOWN':
          return features.multi_godowns === true;

        case 'STAFF_MANAGEMENT':
          return features.staff_attendance_payroll === true;

        case 'USER_ACTIVITY_TRACKER':
          return features.user_activity_tracker === true;

        case 'REPORT_PREMIUM':
          return planName === 'Premium' || planName === 'Enterprise';
          
        case 'REPORT_ENTERPRISE':
          return planName === 'Enterprise';

        default:
          return !!features[actionType];
      }
    } catch (error) {
      return false;
    }
  }
};

module.exports = SubscriptionGuard;
