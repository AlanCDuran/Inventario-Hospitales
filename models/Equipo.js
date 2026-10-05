const mongoose = require('mongoose');
const ESTADOS = ['operativo', 'requiere_revision', 'dado_de_baja'];

const equipoSchema = new mongoose.Schema({
  hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
  nombre: { type: String, required: true, trim: true },
  marca: { type: String, trim: true },
  modelo: { type: String, trim: true },
  serial: { type: String, required: true, trim: true },
  ubicacion: { type: String, trim: true },
  estado: { type: String, enum: ESTADOS, default: 'operativo' },
  fechaUltimaRevision: { type: Date },
  observaciones: { type: String, trim: true }
}, { timestamps: true });

// El serial es único dentro de cada hospital
equipoSchema.index({ hospital: 1, serial: 1 }, { unique: true });

module.exports = mongoose.model('Equipo', equipoSchema);
module.exports.ESTADOS = ESTADOS;
