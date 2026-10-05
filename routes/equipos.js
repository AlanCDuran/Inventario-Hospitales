const router = require('express').Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const Equipo = require('../models/Equipo');
const { ESTADOS } = require('../models/Equipo');

router.use(auth);

const CAMPOS = ['nombre', 'marca', 'modelo', 'serial', 'ubicacion', 'estado', 'fechaUltimaRevision', 'observaciones'];
const pick = (body) => Object.fromEntries(CAMPOS.filter((c) => body[c] !== undefined).map((c) => [c, body[c]]));

// Listado (filtro opcional ?estado= y ?q=)
router.get('/', async (req, res) => {
  const filtro = { hospital: req.user.hospital };
  if (ESTADOS.includes(req.query.estado)) filtro.estado = req.query.estado;
  if (req.query.q) {
    const rx = new RegExp(String(req.query.q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filtro.$or = [{ nombre: rx }, { serial: rx }, { marca: rx }, { ubicacion: rx }];
  }
  res.json(await Equipo.find(filtro).sort({ updatedAt: -1 }));
});

// Resumen por estado
router.get('/resumen', async (req, res) => {
  const datos = await Equipo.aggregate([
    { $match: { hospital: new mongoose.Types.ObjectId(req.user.hospital) } },
    { $group: { _id: '$estado', total: { $sum: 1 } } }
  ]);
  const resumen = { total: 0, operativo: 0, requiere_revision: 0, dado_de_baja: 0 };
  datos.forEach((d) => { resumen[d._id] = d.total; resumen.total += d.total; });
  res.json(resumen);
});

// Crear
router.post('/', async (req, res) => {
  try {
    const equipo = await Equipo.create({ ...pick(req.body), hospital: req.user.hospital });
    res.status(201).json(equipo);
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ error: 'Ya existe un equipo con ese serial en su hospital' });
    res.status(400).json({ error: e.message });
  }
});

// Editar (solo si pertenece al hospital del usuario)
router.put('/:id', async (req, res) => {
  try {
    const equipo = await Equipo.findOneAndUpdate(
      { _id: req.params.id, hospital: req.user.hospital },
      pick(req.body),
      { new: true, runValidators: true }
    );
    if (!equipo) return res.status(404).json({ error: 'Equipo no encontrado' });
    res.json(equipo);
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ error: 'Serial duplicado en su hospital' });
    res.status(400).json({ error: e.message });
  }
});

// Eliminar
router.delete('/:id', async (req, res) => {
  const r = await Equipo.deleteOne({ _id: req.params.id, hospital: req.user.hospital });
  if (!r.deletedCount) return res.status(404).json({ error: 'Equipo no encontrado' });
  res.json({ ok: true });
});

module.exports = router;
