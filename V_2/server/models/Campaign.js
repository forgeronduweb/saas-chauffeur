const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    default: function() {
      return `Campagne ${this.type === 'email' ? 'Email' : 'SMS'} du ${new Date().toLocaleDateString('fr-FR')}`;
    }
  },
  type: {
    type: String,
    required: true,
    enum: ['email', 'sms']
  },
  subject: {
    type: String,
    required: function() {
      return this.type === 'email';
    }
  },
  content: {
    type: String,
    required: true
  },
  groups: [{
    type: String,
    required: true
  }],
  audienceCount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'sending', 'sent', 'failed'],
    default: 'sent'
  },
  sendToMessaging: {
    type: Boolean,
    default: true
  },
  noReply: {
    type: Boolean,
    default: false
  },
  stats: {
    totalRecipients: {
      type: Number,
      default: 0
    },
    messagesSent: {
      type: Number,
      default: 0
    },
    notificationsSent: {
      type: Number,
      default: 0
    },
    openRate: {
      type: Number,
      default: 0
    }
  },
  sentBy: {
    type: String,
    required: true
  },
  sentAt: {
    type: Date,
    default: Date.now
  },
  scheduledDate: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Campaign', campaignSchema);
