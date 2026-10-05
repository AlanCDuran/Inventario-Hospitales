const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

router.post('/login', async (req, res) => {
  const { usuario, password } = req.body || {};
  if (!usuario || !password) return res.status(400).json({ error: 'Faltan datos' });

  const u = await Usuario.findOne({ usuario: String(usuario).trim() }).populate('hospital');
  const ok = u && (await bcrypt.compare(String(password), u.passwordHash));
  if (!ok) return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });

  const token = jwt.sign(
    { uid: u._id, hospital: u.hospital._id },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );
  res.json({ token, hospital: u.hospital.nombre });
});

module.exports = router;
