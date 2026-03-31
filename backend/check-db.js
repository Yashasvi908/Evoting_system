const mongoose = require('mongoose');
const Campaign = require('./models/Campaign');

mongoose.connect('mongodb://localhost:27017/evoting')
  .then(async () => {
    const campaigns = await Campaign.find();
    console.log('--- DATABASE CHECK ---');
    console.log(`Campaigns in DB: ${campaigns.length}`);
    campaigns.forEach(c => {
       console.log(`- ${c.name} (Start: ${c.startDate}, End: ${c.endDate})`);
    });
    console.log('----------------------');
    process.exit(0);
  })
  .catch(err => {
    console.error('DB Error:', err);
    process.exit(1);
  });
