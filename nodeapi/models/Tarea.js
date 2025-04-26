const mongoose = require('mongoose');

const TareaSchema = new mongoose.Schema({
    usuario_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario'
    },
    titulo: String,
    descripcion: String,
    fecha_limite: Date,
    prioridad: {
        type: String,
        enum: ['Alta', 'Media', 'Baja']
    },
    categoria_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Categoria'
    },
    estado: {
        type: String,
        enum: ['pendiente', 'en progreso', 'completada'],
        default: 'pendiente'
    },
    fecha_creacion: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Tarea', TareaSchema);
