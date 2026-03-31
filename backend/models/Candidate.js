const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    party: { 
        type: String, 
        required: true 
    },
    profilePic: { 
        type: String, 
        default: '' 
    },
    partySymbol: { 
        type: String, 
        default: '' 
    },
    symbol: { 
        type: String, 
        default: '' 
    },
    campaignId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Campaign', 
        required: true 
    }
}, { timestamps: true });

module.exports = mongoose.model('Candidate', candidateSchema);
