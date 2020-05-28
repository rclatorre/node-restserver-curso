const express = require('express');
const Cliente = require('../models/cliente'); //Mayuscula pq desde aqui crearemos instancias con new....
const _ = require('underscore');

const { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion');

const app = express();

// -------
// Metodos
// -------

//Mostrar todos los clientes 
app.get('/cliente', verificaToken, (req, res) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    Cliente.find({})
        .skip(desde)
        .limit(15)
        .sort('nombre primerApellido segundoApellido')
        .populate('tipoDocumentoIdentidad', 'descripcion')
        .populate('usuarioAsociado', 'nombre email')
        .populate('paisDeOrigen', 'descripcion')
        .exec((err, clientes) => {
            if (err) {
                // 400 bad request
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                clientes
            });

        });
});

//Mostrar cliente por id
app.get('/cliente/obtener/:id', verificaToken, (req, res) => {
    let id = req.params.id;

    Cliente.findById(id)
        .populate('usuarioAsociado', 'nombre email')
        .populate('tipoDocumentoIdentidad', 'descripcion')
        .exec((err, clienteDB) => {
            if (err) {
                // 400 bad request
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (!clienteDB) {
                // 400 bad request
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Cliente no encontrado'
                    }
                });
            }

            res.json({
                ok: true,
                cliente: clienteDB
            });
        });


});


//Mostrar cliente por id de usuario
app.get('/cliente/usuario/:id', verificaToken, (req, res) => {
    let id = req.params.id;

    Cliente.find({ usuarioAsociado: id })
        .populate('tipoDocumentoIdentidad', 'descripcion')
        .populate('paisDeOrigen', '')
        .exec((err, clienteDB) => {
            if (err) {
                // 400 bad request
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (!clienteDB) {
                // 400 bad request
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Cliente no encontrado'
                    }
                });
            }

            res.json({
                ok: true,
                cliente: clienteDB
            });
        });


});

// Buscar
app.get('/cliente/buscar/:termino', verificaToken, (req, res) => {

    let termino = req.params.termino;

    let regex = new RegExp(termino, 'i');

    Cliente.find({ nombre: regex })
        .populate('tipoDocumentoIdentidad', 'descripcion')
        .exec((err, clientes) => {
            if (err) {
                // 400 bad request
                return res.status(500).json({
                    ok: false,
                    err
                });
            }


            res.json({
                ok: true,
                clientes
            });
        })
});

// Crear cliente
app.post('/cliente/crear', verificaToken, (req, res) => {
    let body = req.body;
    body.usuario = req.usuario;

    // Crea objeto cliente con las propiedades y metodos definidos en Cliente
    let cliente = new Cliente({
        usuarioAsociado: body.usuario._id,
        nombre: body.nombre,
        email: body.email,
        primerApellido: body.primerApellido,
        segundoApellido: body.segundoApellido,
        telefono: body.telefono,
        paisDeOrigen: body.paisDeOrigen_id,
        tipoDocumentoIdentidad: body.tipoDocumentoIdentidad_id,
        numeroDocumentoIdentidad: body.numeroDocumentoIdentidad,
        direccion: body.direccion
    });

    // Llama al metodo de grabacion
    cliente.save((err, clienteDB) => {
        if (err) {
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

        // status 200 no es necesario, va por defecto
        res.json({
            ok: true,
            cliente: clienteDB
        });
    });

});

//Modificar cliente 
app.put('/cliente/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    let body = req.body;

    // Busca y actualiza
    // new: true -> Se usa para devolver el nuevo registro
    // runValidators: true -> Ejecuta las validaciones definidas en Mongo
    //Producto.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, productoDB) => {
    Cliente.findById(id, (err, clienteDB) => {
        if (err) {
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
                err: {
                    message: 'El ID no existe'
                }
            });
        }

        // Completa valores para grabar
        clienteDB.nombre = body.nombre;
        clienteDB.primerApellido = body.primerApellido;
        clienteDB.segundoApellido = body.segundoApellido;
        clienteDB.tipoDocumentoIdentidad = body.tipoDocumentoIdentidad_id;
        clienteDB.numeroDocumentoIdentidad = body.numeroDocumentoIdentidad;

        // Graba
        clienteDB.save((err, clienteGuardado) => {
            if (err) {
                // 500 bad request
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                cliente: clienteGuardado
            });
        });
    });



});

// ---------------
// Borrar cliente
// ---------------
app.delete('/cliente/:id', [verificaToken, verificaAdmin_Role], (req, res) => {
    let id = req.params.id;

    Cliente.findById(id, (err, clienteDB) => {
        if (err) {
            // 400 bad request
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!clienteDB) {
            // 400 bad request
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Cliente no encontrado'
                }
            });
        }

        clienteDB.activo = false;

        clienteDB.save((err, clienteDB) => {
            if (err) {
                // 400 bad request
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                cliente: clienteDB,
                message: 'Cliente inactivado'
            });
        });

    });

});


module.exports = app;