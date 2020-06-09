const express = require('express');
const Configuracion = require('../models/configuracion'); //Mayuscula pq desde aqui crearemos instancias con new....
const Usuario = require('../models/usuario'); //Mayuscula pq desde aqui crearemos instancias con new....
const Cliente = require('../models/cliente'); //Mayuscula pq desde aqui crearemos instancias con new....
const Tabla = require('../models/tabla'); //Mayuscula pq desde aqui crearemos instancias con new....
const bcrypt = require('bcryptjs');
const _ = require('underscore');
const jwt = require('jsonwebtoken');

const { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion');

const Email = require('email-templates');

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
        root: 'server/services/email/templates/seguridad/',
    },
    i18n: {
        locales: ['en', 'es'],
        directory: 'server/assets/i18n',
    }
});






// -------
// Metodos
// -------

// ---
// GET: Obtener los  usuarios
// --- 
app.get('/usuario', verificaToken, (req, res) => {

    // return res.json({
    //     usuario: req.usuario,
    //     nombre: req.usuario.nombre,
    //     email: req.usuario.email
    // });

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    Usuario.find({ estado: true }, 'nombre email role estado google img')
        .skip(desde)
        .limit(limite)
        .exec((err, usuarios) => {
            if (err) {
                // 400 bad request
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            Usuario.collection.countDocuments({ estado: true }, (err, conteo) => {
                res.json({
                    ok: true,
                    usuarios,
                    cuantos: conteo
                });
            });
        });
})

// ---
// GET: Obtener los  usuarios
// ---
app.get('/usuario/id/:id', verificaToken, (req, res) => {
    let id = req.params.id;

    Usuario.findById(id, (err, usuarioDB) => {
        if (err) {
            // 400 bad request
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });


})

// ---
// GET: Obtiene datos del usuario, solo si el token es valido
// --- 
app.get('/usuario/token', verificaToken, (req, res) => {

    res.json({
        ok: true,
        usuario: req.usuario
    });

})

// ----
// GET : Verifica email
// ----
// [verificaToken, verificaAdmin_Role]
app.get('/usuario/verificaEmail/:email', (req, res) => {

    let email = req.params.email;

    Usuario.find({ email: email }, (err, usuarioDB) => {
        if (err) {
            // 400 bad request
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!usuarioDB) {
            // 400 bad request
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            });
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });

});


// ----
// POST: Creacion de usuario
// ----
// [verificaToken, verificaAdmin_Role]
app.post('/usuario/crear', (req, res) => {

    let body = req.body;

    // Crea objeto usuario con las propiedades y metodos definidos en Usuario
    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: 'USER_ROLE'
    });

    // Llama al metodo de grabacion
    usuario.save(async(err, usuarioDB) => {
        if (err) {
            // 400 bad request
            return res.status(400).json({
                ok: false,
                err
            });
        }

        let cliente = new Cliente({
            usuarioAsociado: usuarioDB._id,
            nombre: body.cliente.nombre,
            email: body.cliente.email
        });

        if (body.cliente.primerApellido) cliente.primerApellido = body.cliente.primerApellido;
        if (body.cliente.segundoApellido) cliente.segundoApellido = body.cliente.segundoApellido;
        if (body.cliente.telefono) cliente.telefono = body.cliente.telefono;
        if (body.cliente.direccion) cliente.direccion = body.cliente.direccion;
        if (body.cliente.paisDeOrigen_id === undefined) {
            pais = await obtenerTabla('Paises_España');
            cliente.paisDeOrigen = pais._id;
        } 
        else {
            cliente.paisDeOrigen = body.cliente.paisDeOrigen_id;
        }
        if (body.cliente.tipoDocumentoIdentidad_id === undefined) {
            tipoDocumentoIdentidad = await obtenerTabla('TipoDocumentoIdentidad_DNI');
            cliente.tipoDocumentoIdentidad = tipoDocumentoIdentidad._id;
        } else {
            cliente.tipoDocumentoIdentidad = body.cliente.tipoDocumentoIdentidad_id;
        }
        if (body.cliente.numeroDocumentoIdentidad !== undefined) cliente.numeroDocumentoIdentidad = body.cliente.numeroDocumentoIdentidad;
        if (body.cliente.fechaNacimiento !== undefined) cliente.fechaNacimiento = body.cliente.fechaNacimiento;

        console.log('cliente',cliente);

        // Llama al metodo de grabacion
        cliente.save((err, clienteDB) => {

            if (err) {
                console.log(err);
                // 500 bad request
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (!clienteDB) {
                // 400 bad request
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            // Enviar email
            // enviarEmailActivacion(clienteDB);

            // status 200 no es necesario, va por defecto
            res.json({
                ok: true,
                usuario: usuarioDB
            });

        });


        // // status 200 no es necesario, va por defecto
        // res.json({
        //     ok: true,
        //     usuario: usuarioDB
        // });




    });

});

// ---
// PUT: Actualiza datos del usuario
// ---
// Pick se usa para indicar los atributos actualizables
app.put('/usuario/:id', [verificaToken, verificaAdmin_Role], (req, res) => {

    let id = req.params.id;
    let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']);

    // Busca y actualiza
    // new: true -> Se usa para devolver el nuevo registro
    // runValidators: true -> Ejecuta las validaciones definidas en Mongo
    Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, usuarioDB) => {
        if (err) {
            // 400 bad request
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });

});

// ------
// DELETE
// ------
app.delete('/usuario/:id', [verificaToken, verificaAdmin_Role], (req, res) => {
    let id = req.params.id;

    //            Usuario.findByIdAndRemove(id, (err, usuarioDB) => {
    let cambiaEstado = {
        estado: false
    };

    Usuario.findByIdAndUpdate(id, cambiaEstado, { new: true }, (err, usuarioDB) => {
        if (err) {
            // 400 bad request
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!usuarioDB) {
            // 400 bad request
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            });
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        });

    });

})

// ----
// GET : Recupera password
// ----
// [verificaToken, verificaAdmin_Role]
app.get('/usuario/recuperaPassword/:email', (req, res) => {

    let email = req.params.email;

    Usuario.find({ email: email }, (err, usuarioDB) => {
        if (err) {
            // 400 bad request
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!usuarioDB) {
            // 400 bad request
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Email no encontrado'
                }
            });
        }

        // Genera un nuevo token, envia email y retorna ok
        // process.env.SEED_TOKEN se creo en heroku
        let token = jwt.sign({
            email: usuarioDB[0].email
        }, process.env.SEED_TOKEN, { expiresIn: process.env.CADUCIDAD_TOKEN_RECUPERACION });

        console.log('token generado', token);


        // Envia email
        let enlace = process.env.URLFront + `/#/recuperaPassword/${token}`;
        enviarEmailRecuperacionPassword({ email: usuarioDB[0].email, nombre: usuarioDB[0].nombre, enlace: enlace })
        .then(resp =>{
            res.json({
                ok: true,
                email: usuarioDB[0].email
            });
        }).catch(e => {
            res.json({
                ok: false,
                error: e
            });
        });


    });

});

let enviarEmailRecuperacionPassword = async(datosEmail) => {

    let configuracion = await getConfiguracion();

    email.send({
            template: 'recupera-password',
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

}


/*
Datos de la empresa
*/
let getConfiguracion = async() => {

    let configuracion = await Configuracion.find();

    return configuracion[0];
}

/*
Obtiene valor de tabla
*/
let obtenerTabla = async(codigo) => {
    return new Promise((resolve, reject) => {

        Tabla.find({ codigo: codigo })
            .exec((err, tabla) => {
                if (err) {
                    // 400 bad request   
                    reject('Error');
                }
                resolve(tabla[0]);
            });
    })
}


module.exports = app;