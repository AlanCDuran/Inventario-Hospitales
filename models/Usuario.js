const mongoose = require('mongoose');
module.exports = mongoose.model('Usuario', new mongoose.Schema({
  usuario: { type: String, required: true, unique: true, trim: true },
  passwordHash: { type: String, required: true },
  hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true }
}));
