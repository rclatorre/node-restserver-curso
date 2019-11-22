const express = require('express');
const bcrypt = require('bcryptjs');
const Usuario = require('../models/usuario');
const jwt = require('jsonwebtoken');
const app = express();

app.post('/login', (req, res) => {

    let body = req.body;
    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
        if (err) {
            // 500 server error
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!usuarioDB) {
            // 400 bad request
            return res.status(400).json({
                ok: false,
                err: {
                    message: '(Usuario) o contraseña incorrectos'
                }
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            // 400 bad request
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario o (contraseña) incorrectos'
                }
            });

        }

        // process.env.SEED_TOKEN se creo en heroku
        let token = jwt.sign({
            usuario: usuarioDB
        }, process.env.SEED_TOKEN, { expiresIn: process.env.CADUCIDAD_TOKEN });

        res.json({
            ok: true,
            usuario: usuarioDB,
            token
        });

    });


});

module.exports = app;