const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    required: true
  },
  link: {
    type: String,
    default: ''
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  location: {
    type: String,
    enum: ['home', 'offers', 'marketplace'],
    default: 'home'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Banner', bannerSchema);
