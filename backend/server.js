const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Models
const User = require('./models/User');
const Campaign = require('./models/Campaign');
const Candidate = require('./models/Candidate');
const Notice = require('./models/Notice');
const Vote = require('./models/Vote'); // Added Vote model import

// Controllers
const { loginUser, getProfile } = require('./controllers/authController');
const { createCampaign, getAllCampaigns, getActiveCampaigns } = require('./controllers/campaignController');
const { castVote, getStatus, getVoterHistory } = require('./controllers/voteController');
const { getResults } = require('./controllers/resultController');
const { protect, adminOnly } = require('./middleware/authMiddleware');

connectDB().then(async () => {
    try {
        // 🗑️ EMERGENCY PURGE: Clear corrupted null-id records
        await Vote.deleteMany({ receiptId: null });
        console.log('🧹 [CLEANER] Corrupted null-node records purged');

        let admin = await User.findOne({ voterId: 'admin' });
        if (!admin) {
            admin = new User({ 
                voterId: 'admin', 
                name: 'System Admin', 
                password: 'admin', 
                role: 'admin',
                loginAttempts: 0 
            });
            await admin.save();
            console.log('✅ Default Admin created');
        } else {
            admin.password = 'admin'; 
            admin.loginAttempts = 0;
            admin.isLocked = false;
            await admin.save();
            console.log('✅ Admin credentials reset');
        }
    } catch (e) { console.error('❌ Startup error:', e.message); }
});

const app = express();
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.get('/', (req, res) => res.send('EVOTING SERVER ALIVE AT PORT 5001'));

// AUTH ROUTES
app.post('/api/auth/login', loginUser);
app.get('/api/auth/me', protect, getProfile);

app.post('/api/campaign', protect, adminOnly, createCampaign);
app.get('/api/campaign', protect, getAllCampaigns);
app.get('/api/campaign/active', protect, getActiveCampaigns);

app.post('/api/candidate', protect, adminOnly, async(req, res) => {
    try {
        const candidate = await Candidate.create(req.body);
        res.status(201).json(candidate);
    } catch(e) { res.status(500).json({ message: e.message }); }
});

app.get('/api/candidate/:campaignId', protect, async(req, res) => {
    try {
        const cId = req.params.campaignId || req.query.campaignId;
        const candidates = await Candidate.find({ campaignId: cId });
        res.json(candidates);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

app.post('/api/vote/cast', protect, castVote);
app.get('/api/vote/history', protect, getVoterHistory);
app.get('/api/vote/status/:campaignId', protect, getStatus);

app.put('/api/campaign/:id', protect, adminOnly, async (req, res) => {
  try {
    const updated = await Campaign.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.delete('/api/campaign/:id', protect, adminOnly, async (req, res) => {
  try {
    await Campaign.findByIdAndDelete(req.params.id);
    await Candidate.deleteMany({ campaignId: req.params.id });
    res.json({ message: 'Campaign deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.get('/api/candidates', protect, async (req, res) => {
  try {
    const candidates = await Candidate.find().populate('campaignId');
    res.json(candidates);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.get('/api/notices', async (req, res) => {
  try {
    const notices = await Notice.find().sort({ createdAt: -1 }).limit(10);
    res.json(notices);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.get('/api/voters', protect, adminOnly, async (req, res) => {
  try {
    const voters = await User.find({ role: 'voter' }).select('-password');
    res.json(voters);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.post('/api/auth/register-bulk', protect, adminOnly, async (req, res) => {
  try {
    const voters = req.body;
    let count = 0;
    for (const v of voters) {
       if(!v.voterId) continue;
       const exists = await User.findOne({ voterId: v.voterId });
       if (!exists) {
         const newUser = new User({ ...v, role: 'voter' });
         await newUser.save();
         count++;
       }
    }
    res.json({ message: `Voters synced: ${count} Added` });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.get('/api/result/:campaignId', protect, getResults);

const PORT = 5001;
app.listen(PORT, () => {
    console.log(`SECURE EVOTING SERVER RUNNING ON PORT 5001`);
});
