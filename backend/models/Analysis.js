const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  resumeText: { type: String, required: true },
  jobDescription: { type: String, required: true },
  fileName: String,
  matchScore: { type: Number, min: 0, max: 100 },
  isFit: Boolean,
  summary: String,
  strengths: [String],
  weaknesses: [String],
  suggestions: [String],
  updatedResume: String,
  missingKeywords: [String],
  matchedKeywords: [String],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Analysis', analysisSchema);
