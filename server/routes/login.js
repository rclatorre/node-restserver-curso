const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//Estas dos linea son para autenticacion con google
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);

const Usuario = require('../models/usuario');
const app = express();

// ============================================================================================
// Login  tradicional, usuario y password
// Ruta llamada desde 
// ============================================================================================
app.post('/login', (req, res) => {

    // En body viene email y password
    let body = req.body;

    // Busca en la coleccion de  usuarios con el email ingresado
    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
        if (err) {
            // 500 server error
            return res.status(500).json({
                ok: false,
                err
            });
        }



        if (!usuarioDB) {
            // Si no existe el email ingresado, termina

            // 400 bad request
            return res.status(400).json({
                ok: false,
                err: {
                    message: '(Usuario) o contraseña incorrectos'
                }
            });
        }


        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            // Compara password ingresado con el registrado en la coleccion usuario, si no coinciden termina    

            // 400 bad request
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario o (contraseña) incorrectos'
                }
            });
        }

        // Genera un nuevo token y retorna ok, usuario y token
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

// ============================================================================================
// Login con Google 
// Ruta llamada desde la funcion onSignIn de index.html luego de hacer las validaciones con Google
// ============================================================================================
app.post('/google', async(req, res) => {

    // Recibimos el token de google
    let token = req.body.idtoken;

    // La funcion verify llama a una funcion de verificacion provista por google para validar el token
    let googleUser = await verify(token)
        .catch(e => {
            return res.status(403).json({ // 403 Forbidden
                ok: false,
                err: e
            });

        });

    // Busca el correo eletronico en la coleccion usuarios de Mongo
    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
        if (err) {
            // 500 server error
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (usuarioDB) {
            // Cuando encontro un usuario con el email registrado por google

            if (usuarioDB.google === false) {
                // Si el usuario que se encontro no se registro usando la autenticacion de google, termina indicando que se autentique de la forma tradicional

                // 400 server error
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Debe de usar su autenticacion normal'
                    }
                });

            } else {
                // Si el usuario se registro usando la autenticacion de google se genera un nuevo token interno

                // Genera un token propio con los datos del usuario
                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED_TOKEN, { expiresIn: process.env.CADUCIDAD_TOKEN });

                // Retorna ok, usuario y token generado
                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token,
                });
            }
        } else {
            // Si el usuario no existe en la BD, quiere decr que es nuevo, se crea y se retorna token interno

            let usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)'; // Ya que es obligatorio se coloca esto, pero no sera usado

            //Guarda el nuevo usuario
            usuario.save((err, usuarioDB) => {

                if (err) {
                    // 500 server error
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }

                // Genera un token interno para el nuevo usuario
                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED_TOKEN, { expiresIn: process.env.CADUCIDAD_TOKEN });

                // Retorna ok, usuario y token generado
                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token,
                });

            });
        }
    });
});

// ============================================================================================
// Configuraciones de Google,
// Ojo: ES8 para usar async
// Agregaue argumento token y process.env.CLIENT_ID
// ============================================================================================
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


module.exports = app;