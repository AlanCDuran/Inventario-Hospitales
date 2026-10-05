// Crea los 10 hospitales y un usuario por hospital con contraseña aleatoria.
// Las credenciales se guardan en credenciales.txt (no se sube a git).
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const fs = require('fs');
const Hospital = require('./models/Hospital');
const Usuario = require('./models/Usuario');

// TODO: reemplace por los nombres reales de los 10 hospitales
const NOMBRES = Array.from({ length: 10 }, (_, i) => `Hospital ${i + 1}`);

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const lineas = [];
  for (let i = 0; i < NOMBRES.length; i++) {
    const hospital = await Hospital.findOneAndUpdate(
      { nombre: NOMBRES[i] }, { nombre: NOMBRES[i] }, { upsert: true, new: true }
    );
    const usuario = `hospital${String(i + 1).padStart(2, '0')}`;
    if (await Usuario.exists({ usuario })) { lineas.push(`${NOMBRES[i]} | ${usuario} | (ya existía)`); continue; }
    const password = crypto.randomBytes(5).toString('hex');
    await Usuario.create({ usuario, passwordHash: await bcrypt.hash(password, 10), hospital: hospital._id });
    lineas.push(`${NOMBRES[i]} | ${usuario} | ${password}`);
  }
  fs.writeFileSync('credenciales.txt', lineas.join('\n'));
  console.log(lineas.join('\n'));
  console.log('\nCredenciales guardadas en credenciales.txt');
  await mongoose.disconnect();
})();
