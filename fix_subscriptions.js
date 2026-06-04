const { sequelize, Company, UserCompany, Subscription, Plan } = require('./backend/models');

async function fix() {
  await sequelize.authenticate();
  
  // Find all companies without a subscription
  const companies = await Company.findAll({
    include: [{ model: Subscription }]
  });
  
  for (const company of companies) {
    if (!company.Subscription) {
      console.log(`Fixing company ${company.name} (${company.id})`);
      
      // Find owner
      let ownerId = company.owner_id;
      if (!ownerId) {
        const uc = await UserCompany.findOne({ where: { company_id: company.id, role: 'owner' } });
        if (uc) ownerId = uc.user_id;
      }
      
      if (!ownerId) continue;
      
      // Find owner's companies
      const ownedCompanies = await UserCompany.findAll({ where: { user_id: ownerId, role: 'owner' } });
      const companyIds = ownedCompanies.map(uc => uc.company_id);
      
      // Find highest plan among those companies
      const allSubs = await Subscription.findAll({
        where: { company_id: companyIds, status: 'active' },
        include: [Plan]
      });
      
      let bestSub = null;
      let highestLimit = -1;
      
      allSubs.forEach(sub => {
        let features = sub.Plan?.features || {};
        if (typeof features === 'string') {
            try { features = JSON.parse(features); } catch(e) {}
        }
        const limit = parseInt(features.manage_businesses) || 1;
        if (limit > highestLimit) {
            highestLimit = limit;
            bestSub = sub;
        }
      });
      
      if (bestSub) {
        await Subscription.create({
          company_id: company.id,
          plan_id: bestSub.plan_id,
          start_date: new Date(),
          expiry_date: bestSub.expiry_date,
          status: 'active',
          payment_status: 'paid',
          usage: { invoices: 0, products: 0, eway_bills: 0, godowns: 0 }
        });
        console.log(`Assigned plan ${bestSub.Plan.plan_name} to company ${company.name}`);
      }
    }
  }
  
  console.log("Done");
  process.exit(0);
}

fix();
