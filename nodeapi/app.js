const express = require('express');
const mongoose = require('mongoose');
const app = express();

app.use(express.json());

mongoose.connect('mongodb://mongodb:27017/PlanSync')
    .then(() => console.log(' Conectado a MongoDB desde Node'))
    .catch(err => console.error(' Error al conectar con Mongo', err));


// Rutas
app.use('/usuarios', require('./routes/usuarios'));
app.use('/tareas', require('./routes/tareas'));
app.use('/categorias', require('./routes/categorias'));
app.use('/recordatorios', require('./routes/recordatorios'));

app.listen(4001, () => {
    console.log('Servidor escuchando en http://localhost:4001');
});