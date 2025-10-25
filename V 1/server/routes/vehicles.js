const express = require('express');
const { requireAuth } = require('../middleware/auth');
const Vehicle = require('../models/Vehicle');

const router = express.Router();

router.get('/', async (req, res) => {
  const vehicles = await Vehicle.find().sort({ createdAt: -1 });
  return res.json(vehicles);
});

router.get('/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    return res.json(vehicle);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post('/', requireAuth, async (req, res) => {
  const { make, model, plate, driverId } = req.body || {};
  if (!plate) return res.status(400).json({ error: 'plate required' });
  const vehicle = await Vehicle.create({ make: make || '', model: model || '', plate, driverId: driverId || null });
  return res.status(201).json(vehicle);
});

router.put('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const updated = await Vehicle.findByIdAndUpdate(id, req.body, { new: true });
  if (!updated) return res.status(404).json({ error: 'Vehicle not found' });
  return res.json(updated);
});

router.delete('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const deleted = await Vehicle.findByIdAndDelete(id);
  if (!deleted) return res.status(404).json({ error: 'Vehicle not found' });
  return res.status(204).send();
});

module.exports = router;


