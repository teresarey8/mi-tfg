const express = require('express');
const router = express.Router();
const Categoria = require('../models/Categoria');

router.post('/', async (req, res) => {
    try {
        const nueva = new Categoria(req.body);
        const guardada = await nueva.save();
        res.status(201).json(guardada);
    } catch (err) {
        res.status(500).json({ error: 'Error al crear categoría' });
    }
});

router.get('/', async (req, res) => {
    const categorias = await Categoria.find();
    res.json(categorias);
});

module.exports = router;
