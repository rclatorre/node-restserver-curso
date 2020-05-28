const express = require('express');
const Configuracion = require('../models/configuracion'); //Mayuscula pq desde aqui crearemos instancias con new....
const Tabla = require('../models/tabla'); //Mayuscula pq desde aqui crearemos instancias con new....
const Cliente = require('../models/cliente');
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
        root: 'server/services/email/templates/contacto/',
    },
    i18n: {
        locales: ['en', 'es'],
        directory: 'server/assets/i18n',
    }
});
 
 
//Contacto
app.post('/contacto/mensaje', async(req, res) => {
    let body = req.body;
    let $this_principal = this;

    // Transaccion registrada, envio de email
    enviarEmailContacto(body);

    // status 200 no es necesario, va por defecto
    res.json({
        ok: true
    });
 
 
});

let enviarEmailContacto = async(datos) => {


    // Obtenemos informacion para el correo electronico
    getInformacionEmailContacto(datos)
        .then(datosEmail => {

            email.send({
                    template: 'contacto-mensaje',
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
let getInformacionEmailContacto = async(datos) => {

    let configuracion = await getConfiguracion();

    // Variable que se envia a la plantilla de PUG para que muestre datos variables
    console.log(configuracion.rutaLogotipos);
    let datosEmail = {
        rutaLogotipos: configuracion.rutaLogotipos,
        email: datos.email,
        nombre: datos.name+' '+datos.lastName,
        telefono: datos.phone,
        mensaje: datos.subject
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

/*
Datos de cliente
*/
let obtenerCliente = async(usuario) => {
    return new Promise((resolve, reject) => {

        Cliente.find({ usuarioAsociado: usuario })
            .exec((err, cliente) => {
                if (err) {
                    // 400 bad request
                    reject('Error');
                }
                resolve(cliente[0]);
            });
    })
}


module.exports = app;