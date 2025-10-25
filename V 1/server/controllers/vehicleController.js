const Vehicle = require('../models/Vehicle');

// Obtenir tous les véhicules
const getVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find().populate('driver', 'firstName lastName email');
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtenir un véhicule par ID
const getVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).populate('driver', 'firstName lastName email');
    if (!vehicle) {
      return res.status(404).json({ error: 'Véhicule non trouvé' });
    }
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Créer un nouveau véhicule
const createVehicle = async (req, res) => {
  try {
    const vehicle = new Vehicle(req.body);
    await vehicle.save();
    await vehicle.populate('driver', 'firstName lastName email');
    res.status(201).json(vehicle);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Mettre à jour un véhicule
const updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('driver', 'firstName lastName email');
    
    if (!vehicle) {
      return res.status(404).json({ error: 'Véhicule non trouvé' });
    }
    res.json(vehicle);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Supprimer un véhicule
const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ error: 'Véhicule non trouvé' });
    }
    res.json({ message: 'Véhicule supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle
};
