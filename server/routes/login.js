const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//Estas dos linea son para autenticacion con google
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);

const Usuario = require('../models/usuario');
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

// Configuraciones de Google,
// Ojo: ES8 para usar async
// Agregaue argumento token y process.env.CLIENT_ID
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    };
}



app.post('/google', async(req, res) => {

    let token = req.body.idtoken;

    let googleUser = await verify(token)
        .catch(e => {
            return res.status(403).json({
                ok: false,
                err: e
            });

        });

    console.log('Nombre', googleUser);

    // res.json({
    //     usuario: googleUser
    // });


    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
        if (err) {
            // 500 server error
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (usuarioDB) {
            if (usuarioDB.google === false) {
                // 400 server error
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Debe de usar su autenticacion normal'
                    }
                });
            } else {
                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED_TOKEN, { expiresIn: process.env.CADUCIDAD_TOKEN });

                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token,
                });
            }
        } else {
            // Si el usuario no existe en la BD

            let usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)'; // Ya que es obligatorio se coloca esto, pero no sera usado

            usuario.save((err, usuarioDB) => {
                if (err) {
                    // 500 server error
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }

                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED_TOKEN, { expiresIn: process.env.CADUCIDAD_TOKEN });

                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token,
                });

            });
        }




    });
});

module.exports = app;