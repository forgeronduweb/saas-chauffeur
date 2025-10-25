const Ride = require('../models/Ride');

// Obtenir tous les trajets
const getRides = async (req, res) => {
  try {
    const rides = await Ride.find()
      .populate('driver', 'firstName lastName email')
      .populate('passenger', 'firstName lastName email')
      .populate('vehicle', 'make model licensePlate');
    res.json(rides);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtenir un trajet par ID
const getRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id)
      .populate('driver', 'firstName lastName email')
      .populate('passenger', 'firstName lastName email')
      .populate('vehicle', 'make model licensePlate');
    
    if (!ride) {
      return res.status(404).json({ error: 'Trajet non trouvé' });
    }
    res.json(ride);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Créer un nouveau trajet
const createRide = async (req, res) => {
  try {
    const ride = new Ride(req.body);
    await ride.save();
    await ride.populate([
      { path: 'driver', select: 'firstName lastName email' },
      { path: 'passenger', select: 'firstName lastName email' },
      { path: 'vehicle', select: 'make model licensePlate' }
    ]);
    res.status(201).json(ride);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Mettre à jour un trajet
const updateRide = async (req, res) => {
  try {
    const ride = await Ride.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate([
      { path: 'driver', select: 'firstName lastName email' },
      { path: 'passenger', select: 'firstName lastName email' },
      { path: 'vehicle', select: 'make model licensePlate' }
    ]);
    
    if (!ride) {
      return res.status(404).json({ error: 'Trajet non trouvé' });
    }
    res.json(ride);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Supprimer un trajet
const deleteRide = async (req, res) => {
  try {
    const ride = await Ride.findByIdAndDelete(req.params.id);
    if (!ride) {
      return res.status(404).json({ error: 'Trajet non trouvé' });
    }
    res.json({ message: 'Trajet supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getRides,
  getRide,
  createRide,
  updateRide,
  deleteRide
};
