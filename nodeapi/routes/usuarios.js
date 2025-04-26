const express = require('express');
const router = express.Router();
const Usuario = require('../models/Usuario');

router.post('/', async (req, res) => {
    try {
        const nuevo = new Usuario(req.body);
        const guardado = await nuevo.save();
        res.status(201).json(guardado);
    } catch (err) {
        res.status(500).json({ error: 'Error al crear usuario' });
    }
});

router.get('/', async (req, res) => {
    const usuarios = await Usuario.find();
    res.json(usuarios);
});

module.exports = router;
