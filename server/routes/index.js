const express = require('express');

const app = express();


app.use(require('./configuracion'));
app.use(require('./usuario'));
app.use(require('./login'));
app.use(require('./cliente'));
app.use(require('./upload'));
app.use(require('./imagenes'));
app.use(require('./tabla'));
app.use(require('./tipoTabla'));
app.use(require('./moneda'));
app.use(require('./cotizacion'));
app.use(require('./transaccion'));
app.use(require('./contacto'));

module.exports = app;