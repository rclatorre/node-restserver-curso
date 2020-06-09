const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const uniqueValidator = require('mongoose-unique-validator');
const Moneda = require('./moneda');
const Tabla = require('./tabla');
const Usuario = require('./usuario');
const Cliente = require('./cliente');

let Schema = mongoose.Schema;

let transaccionSchema = new Schema({

    monedaDe: {
        type: Schema.Types.ObjectId,
        ref: 'Moneda',
        validate: {
            validator: async function(v) {
                return await Moneda.findById(v, (err, rec) => rec !== null)
            },
            message: 'Moneda origen invalida'
        }
    },
    monedaA: {
        type: Schema.Types.ObjectId,
        ref: 'Moneda',
        validate: {
            validator: async function(v) {
                return await Moneda.findById(v, (err, rec) => rec !== null)
            },
            message: 'Moneda destino invalida'
        }
    },
    codigoDeA: { type: String, required: [true, 'La combinacion origen destino OOO/DDD es necesaria'] },
    cotizacion: { type: String, required: [true, 'La cotizacion es necesaria'] },
    cantidadDe: { type: String, required: [true, 'La cantidad de origen es necesaria'] },
    cantidadA: { type: String, required: [true, 'La cantidad de destino es necesaria'] },

    /*
    Codigo de tabla: MetodoDePagoTarjeta, MetodoDePagoPresencial
    */
    metodoDePago: {
        type: Schema.Types.ObjectId,
        ref: 'Tabla',
        required: [true, 'El metodo de pago es necesario'],
        validate: {
            validator: async function(v) {
                return await Tabla.findById(v, (err, rec) => rec !== null)
            },
            message: 'Metodo de pago invalido'
        }
    },

    /*
    Codigo de tabla: OpcionEntregaPresencial, OpcionEntregaDelivery
    */
    opcionEntrega: {
        type: Schema.Types.ObjectId,
        ref: 'Tabla',
        required: [true, 'La opcion de entrega es necesaria'],
        validate: {
            validator: async function(v) {
                return await Tabla.findById(v, (err, rec) => rec !== null)
            },
            message: 'Opcion de entrega invalida'
        }
    },

    /*
    Codigo de tabla: CiudadEstablecimientoMadrid, .....
    */
    ciudadEstablecimientoRecojo: {
        type: Schema.Types.ObjectId,
        ref: 'Tabla',
        required: [true, 'La ciudad es necesaria'],
        validate: {
            validator: async function(v) {
                return await Tabla.findById(v, (err, rec) => rec !== null)
            },
            message: 'Ciudad invalida'
        }
    },

    /*
    Codigo de tabla: LocalMadridPrincipal, LocalBarcelona
    */
    establecimientoRecojo: {
        type: Schema.Types.ObjectId,
        ref: 'Tabla',
        required: [true, 'El lugar de recojo necesario'],
        validate: {
            validator: async function(v) {
                return await Tabla.findById(v, (err, rec) => rec !== null)
            },
            message: 'Lugar de recojo invalido'
        }
    },

    /*
     En curso / Pagada / Finalizada / Cancelada
     Codigo de tabla: EstadoTransaccionEnCurso, EstadoTransaccionPagada, EstadoTransaccionFinalizada, EstadoTransaccionCancelada
    */
    estadoDeTransaccion: {
        type: Schema.Types.ObjectId,
        ref: 'Tabla',
        required: [true, 'El estado de la transaccion es necesario'],
        validate: {
            validator: async function(v) {
                return await Tabla.findById(v, (err, rec) => rec !== null)
            },
            message: 'Estado de transaccion invalido'
        }
    },

    usuarioCliente: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: [true, 'El usuario cliente es necesario'],
        validate: {
            validator: async function(v) {
                return await Usuario.findById(v, (err, rec) => rec !== null)
            },
            message: 'Usuario invalido'
        }
    },

    cliente: {
        type: Schema.Types.ObjectId,
        ref: 'Cliente',
        required: [true, 'El cliente es necesario'],
        validate: {
            validator: async function(v) {
                return await Cliente.findById(v, (err, rec) => rec !== null)
            },
            message: 'Cliente invalido'
        }
    },

    fechaRegistro: { type: Date },
    fechaRecogida: { type: Date },

});
/*
Incrementador
*/
/*
Options
This plugin accepts a series of options.

inc_field: The name of the field to increment. Mandatory, default is _id
id: Id of the sequence. Is mandatory only for scoped sequences but its use is strongly encouraged.
reference_fields: The field to reference for a scoped counter. Optional.
start_seq: The number to start the sequence from. Optional, default 1.
inc_amount: The quantity to increase the counter at each increment. Optional, default 1.
disable_hooks: If true, the counter will not be incremented on saving a new document. Default to false
collection_name: By default the collection name to mantain the status of the counters is counters. You can override it using this option
parallel_hooks: If true, hooks will be registered as parallel. Default to true
*/
transaccionSchema.plugin(AutoIncrement, { inc_field: 'numeroTransaccion', start_seq: 2020 });



// // Inicializa campo created
// transaccionSchema.pre < ITransaccion > ('save', function(next) {
//     this.created = new Date();
//     next();
// })

// // Interface que se usa en postSchema.pre
// interface ITransaccion extends Document {
//     monedaDe: string;
//     monedaA: string;
//     codigoDeA: string;
//     cotizacion: string;
//     cantidadDe: string;
//     cantidadA: Date;
//     metodoDePago: string;
//     establecimientoRecojo: string;
//     fechaRegistro: string;
//     usuario: string;
// }

// Cambio de mensajes para las validaciones de duplicados
transaccionSchema.plugin(uniqueValidator, { message: '{PATH} debe de ser unico' });

module.exports = mongoose.model('Transaccion', transaccionSchema);