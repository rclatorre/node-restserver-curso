var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const uniqueValidator = require('mongoose-unique-validator');
const Tabla = require('./tabla');
const Usuario = require('./usuario');

var clienteSchema = new Schema({
    nombre: { type: String, required: [true, 'El nombre es necesario'] },
    primerApellido: { type: String, required: [true, 'El primer apellido es necesario'] },
    segundoApellido: { type: String, required: [false] },
    email: { type: String, unique: true, required: [true, 'El email es necesario'] },
    telefono: { type: String, required: [true, 'El telefono es necesario'] },
    fechaNacimiento: { type: String },
    tipoDocumentoIdentidad: {
        type: Schema.Types.ObjectId,
        ref: 'Tabla',
        required: [true, 'El tipo de documento de identidad es necesario'],
        validate: {
            validator: async function(v) {
                return await Tabla.findById(v, (err, rec) => rec !== null)
            },
            message: 'Tipo de Documento de Identidad invalido'
        }
    },
    numeroDocumentoIdentidad: { type: String, required: [true, 'El numero de documento de identidad es necesario'] },
    direccion: {
        type: String,
        required: [true, 'El pais de origen es necesario'],
    },
    usuarioAsociado: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        validate: {
            validator: async function(v) {
                return await Usuario.findById(v, (err, rec) => rec !== null)
            },
            message: 'Usuario invalido'
        },
        unique: true
    },
    paisDeOrigen: {
        type: Schema.Types.ObjectId,
        ref: 'Tabla',
        required: [true, 'El pais de origen es necesario'],
        validate: {
            validator: async function(v) {
                return await Tabla.findById(v, (err, rec) => rec !== null)
            },
            message: 'Pais invalido'
        }
    },
    activo: { type: Boolean }
});

// clienteSchema.index({
//     paisDeOrigen: 1,
//     tipoDocumentoIdentidad: 1,
//     numeroDocumentoIdentidad: 1,
// }, {
//     unique: true,
// });

// Cambio de mensajes para las validaciones de duplicados
clienteSchema.plugin(uniqueValidator, { message: 'Error, este valor {PATH} debe ser unico.' });

module.exports = mongoose.model('Cliente', clienteSchema);