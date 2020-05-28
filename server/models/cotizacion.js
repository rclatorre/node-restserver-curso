const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const Moneda = require('./moneda');
const Usuario = require('./usuario');

let Schema = mongoose.Schema;

let cotizacionSchema = new Schema({
    codigo: { type: String, unique: true, required: [true, 'La combinacion origen destino OOO/DDD es necesaria'] },
    cotizacion: { type: String, required: [true, 'La cotizacion es necesaria'] },
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
cotizacionSchema.plugin(uniqueValidator, { message: '{PATH} debe de ser unico' });

module.exports = mongoose.model('Cotizacion', cotizacionSchema);