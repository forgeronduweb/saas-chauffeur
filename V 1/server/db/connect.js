const mongoose = require('mongoose');

async function connectToDatabase() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/chauffeurs';
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, { autoIndex: true });
}

module.exports = { connectToDatabase };


