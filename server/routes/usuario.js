const express = require('express');
const Usuario = require('../models/usuario'); //Mayuscula pq desde aqui crearemos instancias con new....
const bcrypt = require('bcryptjs');
const _ = require('underscore');

const { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion');

const app = express();

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
app.get('/usuario/:id', verificaToken, (req, res) => {
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

// ----
// POST: Creacion de usuario
// ----
app.post('/usuario', [verificaToken, verificaAdmin_Role], (req, res) => {

    let body = req.body;

    // Crea objeto usuario con las propiedades y metodos definidos en Usuario
    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });

    // Llama al metodo de grabacion
    usuario.save((err, usuarioDB) => {
        if (err) {
            // 400 bad request
            return res.status(400).json({
                ok: false,
                err
            });
        }

        // status 200 no es necesario, va por defecto
        res.json({
            ok: true,
            usuario: usuarioDB
        });
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



module.exports = app;