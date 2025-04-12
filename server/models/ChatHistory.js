// server/models/ChatHistory.js
const mongoose = require('mongoose');

const ChatHistorySchema = new mongoose.Schema({
  role: {
    type: String,
    required: true,
    enum: ['user', 'bot']
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    required: true
  }
});

module.exports = mongoose.model('ChatHistory', ChatHistorySchema);