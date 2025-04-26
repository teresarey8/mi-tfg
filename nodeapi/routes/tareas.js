const express = require('express');
const router = express.Router();
const Tarea = require('../models/Tarea');

router.post('/', async (req, res) => {
    try {
        const nueva = new Tarea(req.body);
        const guardada = await nueva.save();
        res.status(201).json(guardada);
    } catch (err) {
        res.status(500).json({ error: 'Error al crear tarea' });
    }
});

router.get('/', async (req, res) => {
    const tareas = await Tarea.find();
    res.json(tareas);
});

module.exports = router;
