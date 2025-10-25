const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
  {
    make: { type: String },
    model: { type: String },
    plate: { type: String, required: true, unique: true },
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Vehicle', vehicleSchema);


