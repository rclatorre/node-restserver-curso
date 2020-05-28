var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const uniqueValidator = require('mongoose-unique-validator');
const Tabla = require('./tabla');
const Usuario = require('./usuario');

var configuracionSchema = new Schema({
    ruc: { type: String, required: [true, 'El RUC es necesario'] },
    razonSocial: { type: String, required: [true, 'La razon social es necesaria'] },
    direccion: { type: String, required: [true, 'La direccion es necesaria'] },
    emailTransacciones: { type: String, unique: true, required: [true, 'El email para transacciones es necesario'] },
    telefono: { type: String, required: [true, 'El telefono es necesario'] },
    textosVariables: {
        plazoTransaccion: { type: String, required: [true, 'El plazo de transaccion es necesario'] },
        horarioAtencion: { type: String, required: [true, 'El horario de atencion es necesario'] },
        especialistasEn: { type: String, required: [true, 'El datos especialistas en es necesario'] },
    },
    rutaLogotipos: { type: String },
    servidorDeCorreo: {
        message: {
            from: { type: String }, //'mensajeria.smtp@primesoft.com.pe'
        },
        transport: {
            host: { type: String }, //'rlatorre.ferozo.com'
            port: { type: String }, //465
            secure: { type: Boolean }, //true
            auth: {
                type: { type: String }, //'login'
                user: { type: String }, //'mensajeria.smtp@primesoft.com.pe'
                pass: { type: String } //'Eelcpcep1qa'
            },
            tls: {
                rejectUnauthorized: { type: Boolean }, //false
            }
        }
    },
    activo: { type: Boolean }
});

// Cambio de mensajes para las validaciones de duplicados
// clienteSchema.plugin(uniqueValidator, { message: 'Error, este valor {PATH} debe ser unico.' });

module.exports = mongoose.model('Configuracion', configuracionSchema);