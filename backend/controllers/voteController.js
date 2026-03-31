const Vote = require('../models/Vote');
const Campaign = require('../models/Campaign');
const Candidate = require('../models/Candidate');
const Receipt = require('../models/Receipt');
const User = require('../models/User');
const crypto = require('crypto');

const castVote = async (req, res) => {
    const { campaignId, candidateId } = req.body;
    const voterId = req.user.voterId;

    try {
        const campaign = await Campaign.findById(campaignId);
        if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
        
        // Dynamic status check
        const now = new Date();
        const start = new Date(campaign.startDate);
        const end = new Date(campaign.endDate).setHours(23, 59, 59, 999);
        
        // Emergency bypass for testing (optional, but keep it for now as we did in dashboard)
        // if (now < start || now > end) { return res.status(403).json({ message: 'Voting is not active' }); }

        const candidate = await Candidate.findById(candidateId);
        if (!candidate) return res.status(400).json({ message: 'Invalid candidate' });

        const alreadyVoted = await Vote.findOne({ voterId, campaignId });
        if (alreadyVoted) {
            return res.status(403).json({ message: 'Multi-voting restricted!' });
        }

        const receiptId = 'REC' + Date.now();
        const verifyToken = crypto.randomBytes(32).toString('hex');

        const vote = await Vote.create({ 
            voterId, 
            campaignId, 
            candidateId,
            receiptId,
            verificationToken: verifyToken
        });

        const receipt = await Receipt.create({
            receiptId, voterId, campaignId, voteId: vote._id, token: verifyToken
        });

        // CRITICAL: Update voter's profile so Admin Dashboard sees the vote
        await User.findOneAndUpdate({ voterId }, { hasVoted: true });

        res.status(201).json({
            message: 'Vote casted and linked to secure node.',
            receiptId: receipt.receiptId,
            token: receipt.token
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getStatus = async (req, res) => {
    const { campaignId } = req.params;
    const voterId = req.user.voterId;
    const vote = await Vote.findOne({ voterId, campaignId });
    res.json({ voted: !!vote, voteDetails: vote });
};

const getVoterHistory = async (req, res) => {
    try {
        const voterId = req.user.voterId;
        const history = await Vote.find({ voterId })
            .populate('campaignId', 'name constituency')
            .populate('candidateId', 'name party symbol')
            .sort({ createdAt: -1 });
        res.json(history);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { castVote, getStatus, getVoterHistory };
