const mongoose = require('mongoose');

const receiptSchema = new mongoose.Schema({
  receiptId: { type: String, unique: true, required: true },
  voterId: { type: String, required: true }, // masked during return usually
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
  voteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vote', required: true },
  token: { type: String, unique: true, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Receipt = mongoose.model('Receipt', receiptSchema);
module.exports = Receipt;
