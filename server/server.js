//Carga variables y constantes globales
require('./config/config');

const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();

const bodyParser = require('body-parser');

app.use(cors({ origin: true, credentials: true }));

//------------
// Middlewares
//------------
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

//parse application/json
app.use(bodyParser.json());

//Habilita carpeta public para que pueda ser leida por todos
app.use(express.static(path.resolve(__dirname, '../public')));

// importa todas las rutas 
app.use(require('./routes/index'));

//Conecta con la BD
mongoose.connect(process.env.URLDB, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true }, (err, res) => {
    if (err) throw err;
    console.log('Base de datos online', process.env.URLDB);
});

//Levanta el servidor
app.listen(process.env.PORT, () => {
    console.log('Escuchando en el puerto', process.env.PORT);
})