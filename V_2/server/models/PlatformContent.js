const mongoose = require('mongoose');

const platformContentSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['hero_carousel', 'testimonial', 'partner_logo', 'feature', 'stat', 'faq'],
    index: true
  },
  title: {
    type: String,
    required: function() {
      return ['hero_carousel', 'feature', 'stat', 'faq'].includes(this.type);
    }
  },
  subtitle: {
    type: String
  },
  description: {
    type: String
  },
  imageUrl: {
    type: String,
    required: function() {
      return ['hero_carousel', 'testimonial', 'partner_logo'].includes(this.type);
    }
  },
  link: {
    type: String
  },
  buttonText: {
    type: String
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Pour les témoignages
  author: {
    name: String,
    role: String,
    avatar: String
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  // Pour les statistiques
  value: {
    type: String
  },
  icon: {
    type: String
  },
  // Pour les FAQs
  question: {
    type: String
  },
  answer: {
    type: String
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Index pour améliorer les performances
platformContentSchema.index({ type: 1, isActive: 1, order: 1 });

const PlatformContent = mongoose.model('PlatformContent', platformContentSchema);

module.exports = PlatformContent;
