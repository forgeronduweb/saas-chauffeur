const express = require('express');
const { requireAuth } = require('../middleware/auth');
const Ride = require('../models/Ride');

const router = express.Router();

router.get('/', async (req, res) => {
  const rides = await Ride.find().sort({ createdAt: -1 });
  return res.json(rides);
});

router.get('/:id', async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) {
      return res.status(404).json({ error: 'Ride not found' });
    }
    return res.json(ride);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post('/', requireAuth, async (req, res) => {
  const { clientName, pickup, dropoff, driverId, vehicleId, time } = req.body || {};
  if (!clientName || !pickup || !dropoff) return res.status(400).json({ error: 'missing required fields' });
  const ride = await Ride.create({
    clientName,
    pickup,
    dropoff,
    driverId: driverId || null,
    vehicleId: vehicleId || null,
    time: time || new Date().toISOString(),
    status: 'pending',
  });
  return res.status(201).json(ride);
});

router.put('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const updated = await Ride.findByIdAndUpdate(id, req.body, { new: true });
  if (!updated) return res.status(404).json({ error: 'Ride not found' });
  return res.json(updated);
});

router.delete('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const deleted = await Ride.findByIdAndDelete(id);
  if (!deleted) return res.status(404).json({ error: 'Ride not found' });
  return res.status(204).send();
});

module.exports = router;


