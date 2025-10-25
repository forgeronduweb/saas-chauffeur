const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema(
  {
    clientName: { type: String, required: true },
    pickup: { type: String, required: true },
    dropoff: { type: String, required: true },
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', default: null },
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', default: null },
    time: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending', 'assigned', 'completed', 'cancelled'], default: 'pending' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Ride', rideSchema);


