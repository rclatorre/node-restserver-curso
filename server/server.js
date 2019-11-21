//Carga variables y constantes globales
require('./config/config');

const express = require('express');
const mongoose = require('mongoose');

const app = express();

const bodyParser = require('body-parser');

//------------
// Middlewares
//------------
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

//parse application/json
app.use(bodyParser.json());

// importa la ruta de usuarios que se movio para separar codigo
app.use(require('./routes/usuario'));

//Conecta con la BD
mongoose.connect(process.env.URLDB, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true }, (err, res) => {
    if (err) throw err;
    console.log('Base de datos online');
});

//Levanta el servidor
app.listen(process.env.PORT, () => {
    console.log('Escuchando en el puerto', process.env.PORT);
})