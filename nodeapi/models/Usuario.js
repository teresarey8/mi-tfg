const mongoose = require('mongoose');

const UsuarioSchema = new mongoose.Schema({
    nombre: String,
    email: String,
    password: String,
    username: String,

});

module.exports = mongoose.model('Usuario', UsuarioSchema);
