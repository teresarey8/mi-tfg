const mongoose = require('mongoose');

const CategoriaSchema = new mongoose.Schema({
    nombre: String,
    color: String
});

module.exports = mongoose.model('Categoria', CategoriaSchema);
