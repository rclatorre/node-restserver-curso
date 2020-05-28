const express = require('express');
const Configuracion = require('../models/configuracion'); //Mayuscula pq desde aqui crearemos instancias con new....
const _ = require('underscore');

const { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion');

const app = express();

// -------
// Metodos
// -------

//Mostrar toda la configuracion 
app.get('/configuracion', (req, res) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    Configuracion.find({})
        .skip(desde)
        .limit(15)
        // .sort('nombre primerApellido segundoApellido')
        // .populate('tipoDocumentoIdentidad', 'descripcion')
        // .populate('usuarioAsociado', 'nombre email')
        // .populate('paisDeOrigen', 'descripcion')
        .exec((err, configuracion) => {
            if (err) {
                // 400 bad request
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                configuracion
            });

        });
});

// Crear empresa
app.post('/configuracion/crear', [verificaToken, verificaAdmin_Role], (req, res) => {
    let body = req.body;
    let id_usuario = req.usuario._id;

    // Crea objeto con las propiedades y metodos definidos 
    let configuracion = new Configuracion({
        ruc: body.ruc,
        razonSocial: body.razonSocial,
        telefono: body.telefono,
        direccion: body.direccion,
        emailTransacciones: body.emailTransacciones,
        textosVariables: {
            plazoTransaccion: body.plazoTransaccion,
            horarioAtencion: body.horarioAtencion,
            especialistasEn: body.especialistasEn,
        },
        rutaLogotipos: body.rutaLogotipos,
        servidorDeCorreo: {
            message: {
                from: body.servidorDeCorreoMessageFrom, //'mensajeria.smtp@primesoft.com.pe'
            },
            transport: {
                host: body.servidorDeCorreoTransportHost, //'rlatorre.ferozo.com'
                port: body.servidorDeCorreoTransportPort, // 465
                secure: body.servidorDeCorreoTransportSecure, // true
                auth: {
                    type: body.servidorDeCorreoTransportAuthType, // 'login'
                    user: body.servidorDeCorreoTransportAuthUser, // 'mensajeria.smtp@primesoft.com.pe'
                    pass: body.servidorDeCorreoTransportAuthPass // 'Eelcpcep1qa'
                },
                tls: {
                    rejectUnauthorized: body.servidorDeCorreoTransportTls //false
                }
            }
        }
    });

    // Llama al metodo de grabacion
    configuracion.save((err, configuracionDB) => {
        if (err) {
            // 500 bad request
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!configuracionDB) {
            // 400 bad request
            return res.status(400).json({
                ok: false,
                err
            });
        }

        // status 200 no es necesario, va por defecto
        res.json({
            ok: true,
            configuracion: configuracionDB
        });
    });


});


module.exports = app;