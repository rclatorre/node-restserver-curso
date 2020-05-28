const express = require('express');
const TipoTabla = require('../models/tipoTabla'); //Mayuscula pq desde aqui crearemos instancias con new....
const _ = require('underscore');

const { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion');

const app = express();

// -------
// Metodos
// -------

//Mostrar todas los tipos de tablas 
app.get('/tipoTabla', verificaToken, (req, res) => {

    TipoTabla.find({})
        .sort('descripcion')
        .exec((err, tipoTablas) => {
            if (err) {
                // 400 bad request
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                tipoTablas
            });

        });
});

//Mostrar tipo tabla por id
app.get('/tipoTabla/:id', verificaToken, (req, res) => {
    let id = req.params.id;

    TipoTabla.findById(id, (err, tipoTablaDB) => {
        if (err) {
            // 400 bad request
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!tipoTablaDB) {
            // 400 bad request
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Tabla no encontrada'
                }
            });
        }

        res.json({
            ok: true,
            tabla: tipoTablaDB
        });
    });


});

//Mostrar tipo tabla por codigo
app.get('/tipoTabla/codigo/:codigo', verificaToken, (req, res) => {
    let id = req.params.id;

    TipoTabla.find(id, (err, tipoTablaDB) => {
        if (err) {
            // 400 bad request
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!tipoTablaDB) {
            // 400 bad request
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Tabla no encontrada'
                }
            });
        }

        res.json({
            ok: true,
            tabla: tipoTablaDB
        });
    });


});

//Crear tipo tabla 
app.post('/tipoTabla', verificaToken, (req, res) => {
    let body = req.body;

    // Crea objeto tipo tabla con las propiedades y metodos definidos en Usuario
    let tipoTabla = new TipoTabla({
        codigo: body.codigo,
        descripcion: body.descripcion
    });

    // Llama al metodo de grabacion
    tipoTabla.save((err, tipoTablaDB) => {
        if (err) {
            // 500 bad request
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!tipoTablaDB) {
            // 400 bad request
            return res.status(400).json({
                ok: false,
                err
            });
        }

        // status 200 no es necesario, va por defecto
        res.json({
            ok: true,
            tipoTabla: tipoTablaDB
        });
    });

});

//Modificar tipo tabla
app.put('/tipoTabla/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    let body = req.body;

    // Busca y actualiza
    // new: true -> Se usa para devolver el nuevo registro
    // runValidators: true -> Ejecuta las validaciones definidas en Mongo
    TipoTabla.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, tipoTablaDB) => {
        if (err) {
            // 500 bad request
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!tipoTablaDB) {
            // 400 bad request
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            tipoTabla: tipoTablaDB
        });
    });


});

//Borrar tipo tabla 
app.delete('/tipoTabla/:id', [verificaToken, verificaAdmin_Role], (req, res) => {
    let id = req.params.id;

    TipoTabla.findByIdAndRemove(id, (err, tipoTablaDB) => {
        if (err) {
            // 400 bad request
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!tipoTablaDB) {
            // 400 bad request
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Tipo Tabla no encontrada'
                }
            });
        }

        res.json({
            ok: true,
            message: 'Tipo Tabla borrada'
        });

    });

});


module.exports = app;