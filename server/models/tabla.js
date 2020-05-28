const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const TipoTabla = require('./tipoTabla');
const Usuario = require('./usuario');

let Schema = mongoose.Schema;

let tablaSchema = new Schema({
    codigo: { type: String, unique: true, required: [true, 'El codigo es necesario'] },
    descripcion: { type: String, required: [true, 'La descripcion es necesaria'] },
    tipoTabla: {
        type: Schema.Types.ObjectId,
        ref: 'TipoTabla',
        required: [true, 'El tipo de tabla es necesario'],
        validate: {
            validator: async function(v) {
                return await TipoTabla.findById(v, (err, rec) => rec !== null)
            },
            message: 'Tipo de tabla invalido'
        }
    },
    valorUno: { type: String },
    valorDos: { type: String },
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        validate: {
            validator: async function(v) {
                return await Usuario.findById(v, (err, rec) => rec !== null)
            },
            message: 'Usuario invalido'
        }
    },
    activo: { type: Boolean }
});

// Cambio de mensajes para las validaciones de duplicados
//categoriaSchema.plugin(uniqueValidator, { message: '{PATH} debe de ser unico' });

module.exports = mongoose.model('Tabla', tablaSchema);