const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const Usuario = require('./usuario');

let Schema = mongoose.Schema;

let tipoTablaSchema = new Schema({
    codigo: { type: String, unique: true, required: [true, 'El codigo es necesario'] },
    descripcion: { type: String, required: [true, 'La descripcion es necesaria'] },
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
//categoriaSchema.plugin(uniqueValidator, { message: '{PATH} debe de ser unico' });

module.exports = mongoose.model('TipoTabla', tipoTablaSchema);