const Vote = require('../models/Vote');
const Candidate = require('../models/Candidate');
const Campaign = require('../models/Campaign');
const mongoose = require('mongoose');

const getResults = async (req, res) => {
    const { campaignId } = req.params;

    try {
        const campaign = await Campaign.findById(campaignId);
        if(!campaign) return res.status(404).json({ message: 'Campaign not found' });

        // Foolproof lookup for both String and ObjectId formats
        const allVotes = await Vote.find({ 
            $or: [
                { campaignId: campaignId },
                { campaignId: new mongoose.Types.ObjectId(campaignId) }
            ]
        });
        console.log(`[LEDGER AUDIT] QUERY CAMPAIGN: ${campaignId} | TOTAL VOTES IN NODE: ${allVotes.length}`);

        const candidates = await Candidate.find({ campaignId });
        console.log(`[LEDGER AUDIT] CANDIDATES FOUND IN ARENA: ${candidates.map(c => c.name).join(', ')}`);

        const finalResults = candidates.map(c => {
            const candidateVotes = allVotes.filter(v => 
                String(v.candidateId) === String(c._id)
            ).length;
            
            const total = allVotes.length;
            
            return {
                candidateId: c._id,
                name: c.name,
                party: c.party,
                votes: candidateVotes,
                percentage: total > 0 ? ((candidateVotes / total) * 100).toFixed(1) : 0
            };
        });

        // Sort results by votes descending to get winner at [0]
        const sortedResults = finalResults.sort((a, b) => b.votes - a.votes);

        res.json({
            campaignName: campaign.name,
            totalVotesCast: allVotes.length,
            results: sortedResults
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getResults };
