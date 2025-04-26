const express = require('express');
const router = express.Router();
const Recordatorio = require('../models/Recordatorio');

router.post('/', async (req, res) => {
    try {
        const nuevo = new Recordatorio(req.body);
        const guardado = await nuevo.save();
        res.status(201).json(guardado);
    } catch (err) {
        res.status(500).json({ error: 'Error al crear recordatorio' });
    }
});

router.get('/', async (req, res) => {
    const recordatorios = await Recordatorio.find();
    res.json(recordatorios);
});

module.exports = router;
