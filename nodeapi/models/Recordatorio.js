const mongoose = require('mongoose');

const RecordatorioSchema = new mongoose.Schema({
    tarea_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tarea'
    },
    usuario_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario'
    },
    fecha_recordatorio: Date,
    titulo: String
});

module.exports = mongoose.model('Recordatorio', RecordatorioSchema);
