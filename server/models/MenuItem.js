const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, default: '' },
  ingredients: [{ type: String }],
  image: { type: String, default: '' },
  variants: [{
    name: { type: String },
    price: { type: Number }
  }],
  isSpicy: { type: Boolean, default: false },
  isPopular: { type: Boolean, default: false },
  isAvailable: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('MenuItem', menuItemSchema);
