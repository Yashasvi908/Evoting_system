const mongoose = require('mongoose');
const User = require('./models/User');
const Vote = require('./models/Vote');
const Candidate = require('./models/Candidate');
const Campaign = require('./models/Campaign');

async function checkDatabase() {
    try {
        await mongoose.connect('mongodb+srv://vansh:vansh123@cluster0.zps3p.mongodb.net/evoting?retryWrites=true&w=majority');
        console.log('--- DATABASE DIAGNOSTICS ---');
        
        const totalUsers = await User.countDocuments();
        const totalVoters = await User.countDocuments({ role: 'voter' });
        const votedUsers = await User.countDocuments({ role: 'voter', hasVoted: true });
        const totalVotes = await Vote.countDocuments();
        const allVotes = await Vote.find();
        
        console.log(`Total Users: ${totalUsers}`);
        console.log(`Total Voters: ${totalVoters}`);
        console.log(`Voted Users (hasVoted:true): ${votedUsers}`);
        console.log(`Total Votes in Vote Collection: ${totalVotes}`);
        
        if (totalVotes > 0) {
            console.log('\n--- VOTE DETAILS (Sample) ---');
            allVotes.forEach((v, i) => {
                console.log(`Vote ${i+1}: VoterID=${v.voterId}, CampaignID=${v.campaignId}, CandidateID=${v.candidateId}`);
            });
        }

        const allCampaigns = await Campaign.find();
        console.log('\n--- CAMPAIGN IDS ---');
        allCampaigns.forEach(c => console.log(`${c.name}: ${c._id}`));

        const allCandidates = await Candidate.find();
        console.log('\n--- CANDIDATE IDS ---');
        allCandidates.forEach(c => console.log(`${c.name}: ${c._id} (Campaign: ${c.campaignId})`));

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkDatabase();
