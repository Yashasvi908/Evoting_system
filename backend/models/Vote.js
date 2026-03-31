const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  voterId: { type: String, required: true },
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
  timestamp: { type: Date, default: Date.now },
  receiptId: { type: String, unique: true, sparse: true },
  verificationToken: { type: String, unique: true, sparse: true }
});

// Force unique vote per voter per campaign
voteSchema.index({ voterId: 1, campaignId: 1 }, { unique: true });

const Vote = mongoose.model('Vote', voteSchema);
module.exports = Vote;
