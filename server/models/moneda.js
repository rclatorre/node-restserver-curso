const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const Tabla = require('./tabla');
const Usuario = require('./usuario');

let Schema = mongoose.Schema;

let monedaSchema = new Schema({
    codigo: { type: String, unique: true, required: [true, 'El codigo es necesario'] },
    descripcion: { type: String, required: [true, 'La descripcion es necesaria'] },
    pais: {
        type: Schema.Types.ObjectId,
        ref: 'Tabla',
        required: [true, 'El pais es necesario'],
        validate: {
            validator: async function(v) {
                return await Tabla.findById(v, (err, rec) => rec !== null)
            },
            message: 'Pais invalido'
        }
    },
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        validate: {
            validator: async function(v) {
                return await Usuario.findById(v, (err, rec) => rec !== null)
            },
            message: 'Usuario invalido'
        }
    }
});

// Cambio de mensajes para las validaciones de duplicados
monedaSchema.plugin(uniqueValidator, { message: '{PATH} debe de ser unico' });

module.exports = mongoose.model('Moneda', monedaSchema);