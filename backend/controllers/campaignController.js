const Campaign = require('../models/Campaign');

// Memory Mode Fallback
let memoryCampaigns = [];

const createCampaign = async (req, res) => {
    const { name, constituency, startDate, endDate } = req.body;
    try {
        const campaign = await Campaign.create({
            name,
            constituency,
            startDate,
            endDate
        });
        res.status(201).json(campaign);
    } catch (error) {
        console.warn('⚠️ FALLING BACK TO MEMORY MODE FOR CAMPAIGN CREATION');
        const mockCampaign = {
            _id: 'mock_' + Date.now(),
            name,
            constituency,
            startDate,
            endDate,
            createdAt: new Date()
        };
        memoryCampaigns.push(mockCampaign);
        res.status(201).json(mockCampaign);
    }
};

const getAllCampaigns = async (req, res) => {
    try {
        const campaigns = await Campaign.find({}).lean();
        console.log(`[SECURE NODE] Dispatching ${campaigns.length} campaigns to ${req.user?.voterId}`);
        res.json(campaigns);
    } catch (err) {
        console.warn('⚠️ FALLING BACK TO MEMORY MODE FOR FETCHING CAMPAIGNS');
        res.json(memoryCampaigns);
    }
};

const getActiveCampaigns = async (req, res) => {
    try {
        const now = new Date();
        const campaigns = await Campaign.find({
            startDate: { $lte: now },
            endDate: { $gte: now }
        });
        res.json(campaigns);
    } catch (err) {
        res.json(memoryCampaigns);
    }
};

module.exports = { createCampaign, getAllCampaigns, getActiveCampaigns };

