const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  name: { type: String, required: true },
  constituency: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true }
}, { timestamps: true });

// Virtual to calculate status dynamically
campaignSchema.virtual('status').get(function() {
    const now = new Date();
    if (now < this.startDate) return 'upcoming';
    if (now >= this.startDate && now <= this.endDate) return 'active';
    return 'ended';
});

// Ensure virtuals are serialized
campaignSchema.set('toJSON', { virtuals: true });
campaignSchema.set('toObject', { virtuals: true });

const Campaign = mongoose.model('Campaign', campaignSchema);
module.exports = Campaign;
