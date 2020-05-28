const express = require('express');
const Transaccion = require('../models/transaccion'); //Mayuscula pq desde aqui crearemos instancias con new....
const Configuracion = require('../models/configuracion'); //Mayuscula pq desde aqui crearemos instancias con new....
const Tabla = require('../models/tabla'); //Mayuscula pq desde aqui crearemos instancias con new....
const Moneda = require('../models/moneda');
const Cliente = require('../models/cliente');
const Cotizacion = require('../models/cotizacion');
const _ = require('underscore');
const { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion');
const Email = require('email-templates');
const stripe = require('stripe')('sk_test_nl14RvA2l9tnfHUCEN3rgQxv');

const app = express();


const email = new Email({
    message: {
        from: 'mensajeria.smtp@primesoft.com.pe',
    },
    // send: true,
    transport: {
        host: 'rlatorre.ferozo.com',
        port: 465,
        secure: true,
        auth: {
            type: 'login',
            user: 'mensajeria.smtp@primesoft.com.pe',
            pass: 'Eelcpcep1qa'
        },
        tls: {
            rejectUnauthorized: false
        }
    },
    views: {
        options: {
            extension: 'pug',
        },
        root: 'server/services/email/templates/transacciones/',
    },
    i18n: {
        locales: ['en', 'es'],
        directory: 'server/assets/i18n',
    }
});






// -------
// Metodos
// -------
//Mostrar transaccion por id
app.get('/transaccion/obtener/:id', verificaToken, (req, res) => {
    let id = req.params.id;

    Transaccion.findById(id)
        .populate({ path: 'monedaDe', populate: { path: 'pais', select: 'codigo descripcion valorUno' } })
        .populate({ path: 'monedaA', populate: { path: 'pais', select: 'codigo descripcion valorUno' } })
        .populate('metodoDePago', 'codigo descripcion valorUno')
        .populate('opcionEntrega', 'codigo descripcion valorUno')
        .populate('ciudadEstablecimientoRecojo', 'codigo descripcion valorUno')
        .populate('establecimientoRecojo', 'codigo descripcion valorUno')
        .populate('estadoDeTransaccion', 'codigo descripcion valorUno')
        .populate('usuarioCliente', 'nombre email')
        .populate('cliente')
        .populate({ path: 'cliente', populate: { path: 'paisDeOrigen', select: 'codigo descripcion valorUno' } })
        .populate({ path: 'cliente', populate: { path: 'tipoDocumentoIdentidad', select: 'codigo descripcion valorUno' } })
        .exec((err, transaccionDB) => {
            if (err) {
                // 400 bad request
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (!transaccionDB) {
                // 400 bad request
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Transaccion no encontrada'
                    }
                });
            }

            res.json({
                ok: true,
                transaccion: transaccionDB
            });
        });


});

//Registrar transaccion
app.post('/transaccion/registrar', verificaToken, async(req, res) => {
    let body = req.body;
    let $this_principal = this;

    function obtenerCliente(usuario) {
        return new Promise((resolve, reject) => {

            Cliente.find({ usuarioAsociado: usuario })
                .exec((err, cliente) => {
                    if (err) {
                        // 400 bad request
                        reject('Error');
                    }
                    console.log('cliente en obtenerCliente', cliente);
                    resolve(cliente[0]);
                });
        })
    }


    // Crea objeto transaccion con las propiedades y metodos definidos en Transaccion
    let transaccion = new Transaccion({
        monedaDe: body.monedaDe_id,
        monedaA: body.monedaA_id,
        codigoDeA: body.codigoDeA,
        cotizacion: body.cotizacion,
        cantidadDe: body.cantidadDe,
        cantidadA: body.cantidadA,
        metodoDePago: body.metodoDePago_id,
        opcionEntrega: body.opcionEntrega_id,
        ciudadEstablecimientoRecojo: body.ciudadEstablecimientoRecojo_id,
        establecimientoRecojo: body.establecimientoRecojo_id
    });

    // Traer el primer estado 
    transaccion.estadoDeTransaccion = '5e544d4a92c69d6b2c1ef85c';

    transaccion.usuarioCliente = req.usuario._id;

    // transaccion.cliente = '5e3b7befbc1622046cf47cdf';
    await obtenerCliente(req.usuario._id).then((resp) => {

        // Asignamos id de cliente a la transaccion
        transaccion.cliente = resp;

        // Llama al metodo de grabacion
        transaccion.save((err, transaccionDB) => {

            if (err) {
                // 500 bad request
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (!transaccionDB) {
                // 400 bad request
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            // Obtiene transaccion guardada con todos sus populates para enviarla al cliente
            transaccionDB
                .populate({
                    path: 'monedaDe',
                    populate: [
                        { path: 'pais', select: 'codigo descripcion valorUno' },
                    ]
                })
                .populate({
                    path: 'monedaA',
                    populate: [
                        { path: 'pais', select: 'codigo descripcion valorUno' },
                    ]
                })
                .populate({
                    path: 'cliente',
                    populate: [
                        { path: 'tipoDocumentoIdentidad', select: 'codigo descripcion' }
                    ]
                })
                .populate({ path: 'opcionEntrega' })
                .populate({ path: 'ciudadEstablecimientoRecojo' })
                .populate({ path: 'establecimientoRecojo' })
                // .populate('empresa')
                .execPopulate()
                .then(async function(transaccionDB) {

                    // Transaccion registrada, envio de email
                    enviarEmailRegistroTransaccion(transaccionDB);

                    // status 200 no es necesario, va por defecto
                    res.json({
                        ok: true,
                        transaccion: transaccionDB
                    });

                });








        });



    });

});

//Procesar pagos con stripe - transaccion ya debe estar registrada, generar sesion
app.post('/transaccion/sesionPagoonline', verificaToken, async (req, res) => {

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
        price_data: {
            product: '', //{PRODUCT_ID}
            unit_amount: 1500,
            currency: 'usd',
        },
        quantity: 1,
        }],
        mode: 'payment',
        success_url: 'https://example.com/success',
        cancel_url: 'https://example.com/cancel',
    }) 
    .then(res => {

        res.json({
          ok: true,
          session
          });

    }) ;


});



//Procesar pagos con stripe - transaccion ya debe estar registrada
app.post('/transaccion/pagoonline', verificaToken, async (req, res) => {
    
    // https://stripe.com/docs/api/payment_intents/object

    let stripetoken = req.body.stripetoken;
    let amount = req.body.amount;
    let transaction_id = req.body.transaction_id;
 
  
    const paymentIntent = await stripe.paymentIntents.create({
        amount: 1000,
        currency: 'usd',
        payment_method_types: ['card'],
        source: '123',
        receipt_email: 'rclatorre@gmail.com',
      }).then(
          function(result) {
            console.log(result);
            console.log(result.status);

          },
          function(err) {
            console.log(err);

            switch (err.type) {
                case 'StripeCardError':
                  // A declined card error
                  err.message="Invalido"; // => e.g. "Your card's expiration year is invalid."
                  break;
                case 'StripeRateLimitError':
                  // Too many requests made to the API too quickly
                  break;
                case 'StripeInvalidRequestError':
                  // Invalid parameters were supplied to Stripe's API
                  break;
                case 'StripeAPIError':
                  // An error occurred internally with Stripe's API
                  break;
                case 'StripeConnectionError':
                  // Some kind of error occurred during the HTTPS communication
                  break;
                case 'StripeAuthenticationError':
                  // You probably used an incorrect API key
                  break;
                default:
                  // Handle any other types of unexpected errors
                  break;
              }

          }
      );
 
    

    res.json({
        ok: true
    });
      
    /*
    Fuente de informacion
        https://stripe.com/docs/api/metadata

    Tips:
    idempotencyKey: evitar doble cargo si se corto la comunicacion y se envia el requeriiento de pago
        stripe.charges.create({
            amount: 2000,
            currency: "usd",
            source: "tok_mastercard", // obtained with Stripe.js
            description: "My First Test Charge (created for API docs)"
        }, {
            idempotencyKey: "MBRY7IDf4l5XDvDm"
            }, function(err, charge) {
            // asynchronously called
            });
    metadata
        Sample metadata use cases
        Link IDs
        Attach your system's unique IDs to a Stripe object, for easy lookups. For example, add your order number to a charge, your user ID to a customer or recipient, or a unique receipt number to a transfer.

        Refund papertrails
        Store information about why a refund was created, and by whom.

        Customer details
        Annotate a customer by storing an internal ID for your later use.

    */
});

//Nueva transaccion
app.get('/transaccion/nueva', async(req, res) => {

    function obtenerMoneda(codigo) {
        return new Promise((resolve, reject) => {

            Moneda.find({ codigo: codigo })
                .populate('pais', 'descripcion valorUno')
                .exec((err, moneda) => {
                    if (err) {
                        // 400 bad request
                        reject('Error');
                    }

                    resolve(moneda[0]);
                });
        })
    }

    function obtenerTabla(codigo) {
        return new Promise((resolve, reject) => {

            Tabla.find({ codigo: codigo })
                .exec((err, tabla) => {
                    if (err) {
                        // 400 bad request
                        reject('Error');
                    }

                    if (!tabla) {
                        // 400 bad request
                        reject('Error');
                    }

                    resolve(tabla[0]);

                })
        })
    }

    function obtenerCotizacion(codigo) {
        return new Promise((resolve, reject) => {

            Cotizacion.find({ codigo: codigo })
                .exec((err, cotizacion) => {
                    if (err) {
                        // 400 bad request
                        reject('Error');
                    }

                    if (!cotizacion) {
                        // 400 bad request
                        reject('Error');
                    }

                    resolve(parseFloat(cotizacion[0].cotizacion));

                })
        })
    }




    let transaccion;
    // let transaccion = {
    //     monedaDe: { _id: '1', codigo: 'USD', descripcion: 'Dolar', pais: { valorUno: 'us.svg' } },
    //     monedaA: { _id: '2', codigo: 'EUR', descripcion: 'Euro', pais: { valorUno: 'eu.svg' } },
    //     codigoDeA: 'USDEUR',
    //     cotizacion: 0.85,
    //     cantidadDe: 1000,
    //     cantidadA: 850,
    //     metodoDePago: { _id: '5e544c5d14e2281b40680f75', codigo: 'MetodoDePagoTarjeta', descripcion: 'app.tablas.metododepago.metododepagotarjeta', valorUno: 'card' },
    //     opcionEntrega: { _id: '5e659c9695905f42c817c02c', codigo: 'RecojoTienda', descripcion: 'Recojo en tienda', valorUno: 'pin' },
    //     ciudadEstablecimientoRecojo: { _id: '5e656617ce80a239800ac44c', codigo: 'Madrid', descripcion: 'Madrid' },
    //     establecimientoRecojo: { _id: '5e544cef92c69d6b2c1ef859', codigo: 'LocalMadrid1', descripcion: 'Calle Mayor 44 Madrid C.P 28013', ciudad: '1' },
    //     usuarioCliente: 0
    //     numeroTransaccion: 0
    // };

    let monedaDe = await obtenerMoneda('USD');
    let monedaA = await obtenerMoneda('EUR');
    let codigoDeA = 'USDEUR';
    let cotizacion = await obtenerCotizacion(codigoDeA);
    let cantidadDe = 100;
    let cantidadA = 0;
    let metodoDePago = await obtenerTabla('MetodoDePagoTarjeta');
    let opcionEntrega = await obtenerTabla('OpcionEntregaTienda');
    let ciudadEstablecimientoRecojo = await obtenerTabla('CiudadEstablecimientoMadrid');
    let establecimientoRecojo = await obtenerTabla('LocalMadridPrincipal');
    let usuarioCliente = '';
    let cliente = {
        _id: '',
        nombre: '',
        primerApellido: '',
        segundoApellido: '',
        email: '',
        telefono: '',
        fechaNacimiento: '',
        tipoDocumentoIdentidad: {
            _id: '',
            codigo: '',
            descripcion: ''
        },
        numeroDocumentoIdentidad: '',
        direccion: '',
        usuarioAsociado: '',
        paisDeOrigen: {
            _id: '',
            codigo: '',
            descripcion: '',
            valorUno: ''
        }
    };
    let numeroTransaccion = 0;

    cantidadA = cantidadDe * cotizacion;

    transaccion = {
        monedaDe,
        monedaA,
        codigoDeA,
        cotizacion,
        cantidadDe,
        cantidadA,
        metodoDePago,
        opcionEntrega,
        ciudadEstablecimientoRecojo,
        establecimientoRecojo,
        usuarioCliente,
        cliente,
        numeroTransaccion
    };

    res.json({
        ok: true,
        transaccion: transaccion
    });

})

let enviarEmailRegistroTransaccion = async(transaccion) => {

    // email.send({
    //         template: 'transaccion-registrada',
    //         message: {
    //             to: transaccion.cliente.email
    //         },
    //         locals: {
    //             locale: 'en',
    //             nombre: transaccion.cliente.nombre
    //         }
    //     })
    //     .then(console.log)
    //     .catch(console.error);


    // Obtenemos informacion para el correo electronico
    getInformacionEmailRegistroTransaccion(transaccion)
        .then(datosEmail => {

            email.send({
                    template: 'transaccion-registrada',
                    message: {
                        to: datosEmail.email
                            // bcc: datosEmail.emailTransacciones
                    },
                    locals: {
                        locale: 'en',
                        datosEmail,
                        moment: require('moment')
                    }
                })
                .then(console.log)
                .catch(console.error);

        })
        .catch(err => console.log(err));


}

/*
Obtiene informacion necesaria para el email de registro de transaccion
*/
let getInformacionEmailRegistroTransaccion = async(transaccion) => {

    let configuracion = await getConfiguracion();
    // let cuentaBancoDestinoPropio = await getCuentaBancoDestinoPropio(transaccion);
    // let titularDestinoCliente;
    // let documentoIdentidadDestinoCliente;

    // // Determina el titular de la cuenta de deposito del cliente
    // if (transaccion.transferencia.cuentaDestino.tipoPropiedadCuenta.codigo === 'CuentaPropia') {
    //     titularDestinoCliente = transaccion.cliente.nombre + transaccion.cliente.primerApellido + transaccion.cliente.segundoApellido;
    //     documentoIdentidadDestinoCliente = transaccion.cliente.tipoDocumentoIdentidad.descripcion + '-' + transaccion.cliente.numeroDocumentoIdentidad;
    // } else {
    //     titularDestinoCliente = transaccion.empresa.razonSocial;
    //     documentoIdentidadDestinoCliente = transaccion.empresa.ruc;
    // }

    // Variable que se envia a la plantilla de PUG para que muestre datos variables
    console.log(configuracion.rutaLogotipos);
    let datosEmail = {
        rutaLogotipos: configuracion.rutaLogotipos,
        emailTransacciones: configuracion.emailTransacciones,
        numeroTransaccion: transaccion.numeroTransaccion,
        email: transaccion.cliente.email,
        nombre: transaccion.cliente.nombre,
        direccion: transaccion.cliente.direccion,
        fechaHora: transaccion.fechaRegistro,
        razonSocial: configuracion.razonSocial,
        horarioAtencion: configuracion.textosVariables.horarioAtencion,
        plazoTransaccion: configuracion.textosVariables.plazoTransaccion,
        cantidadDe: transaccion.cantidadDe,
        monedaDe: transaccion.monedaDe.codigo,
        cantidadA: transaccion.cantidadA,
        monedaA: transaccion.monedaA.codigo,
        enlace: '',
        opcionEntrega: transaccion.opcionEntrega.codigo,
        ciudadRecojo: transaccion.ciudadEstablecimientoRecojo.descripcion,
        establecimientoRecojo: transaccion.establecimientoRecojo.descripcion
    };

    return datosEmail;
}


/*
Datos de la empresa
*/
let getConfiguracion = async() => {

    let configuracion = await Configuracion.find();

    return configuracion[0];
}

module.exports = app;