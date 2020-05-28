const express = require('express');
const TipoTabla = require('../models/tipoTabla'); //Mayuscula pq desde aqui crearemos instancias con new....
const Tabla = require('../models/tabla'); //Mayuscula pq desde aqui crearemos instancias con new....
const _ = require('underscore');

const { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion');

const app = express();


// -------
// Metodos
// -------

//Mostrar todas las tablas segun el tipo
app.get('/tabla/tipo/:id', verificaToken, (req, res) => {
    let id = req.params.id;

    Tabla.find({ tipoTabla: id })
        .sort('descripcion')
        .exec((err, tablas) => {
            if (err) {
                // 400 bad request
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                tablas
            });

        });
});

//Mostrar todas las tablas segun el codigo de tabla
// verificaToken,
app.get('/tabla/codigotipo/:codigo', (req, res) => {
    let codigo = req.params.codigo;

    //    let regex = new RegExp(codigo, 'i');

    TipoTabla.find({ codigo: codigo })
        .exec((err, tipoTabla) => {
            if (err) {
                // 400 bad request
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (tipoTabla.length === 0) {
                // 400 bad request
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            Tabla.find({ tipoTabla: tipoTabla[0]._id, activo: true })
                .sort('descripcion')
                .exec((err, tablas) => {
                    if (err) {
                        // 400 bad request
                        return res.status(500).json({
                            ok: false,
                            err
                        });
                    }

                    res.json({
                        ok: true,
                        tablas
                    });

                });



        })


});

app.get('/tabla/codigopadre/:codigo/:padre', (req, res) => {
    let codigo = req.params.codigo;
    let padre = req.params.padre;

    //    let regex = new RegExp(codigo, 'i');

    TipoTabla.find({ codigo: codigo })
        .exec((err, tipoTabla) => {
            if (err) {
                // 400 bad request
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (tipoTabla.length === 0) {
                // 400 bad request
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            Tabla.find({ tipoTabla: tipoTabla[0]._id, tablaPadre: padre, activo: true })
                .sort('descripcion')
                .exec((err, tablas) => {
                    if (err) {
                        // 400 bad request
                        return res.status(500).json({
                            ok: false,
                            err
                        });
                    }

                    res.json({
                        ok: true,
                        tablas
                    });

                });



        })


});

//Mostrar tabla por id
app.get('/tabla/:id', verificaToken, (req, res) => {
    let id = req.params.id;

    Tabla.findById(id, (err, tablaDB) => {
        if (err) {
            // 400 bad request
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!tablaDB) {
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
            tabla: tablaDB
        });
    });


});

//Crear tabla 
app.post('/tabla', verificaToken, (req, res) => {
    let body = req.body;

    // Crea objeto tabla con las propiedades y metodos definidos en Usuario
    let tabla = new Tabla({
        codigo: body.codigo,
        descripcion: body.descripcion,
        tipoTabla: body.tipoTabla_id,
        valorUno: body.valorUno,
        activo: true
    });

    // Llama al metodo de grabacion
    tabla.save((err, tablaDB) => {
        if (err) {
            // 500 bad request
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!tablaDB) {
            // 400 bad request
            return res.status(400).json({
                ok: false,
                err
            });
        }

        // status 200 no es necesario, va por defecto
        res.json({
            ok: true,
            tabla: tablaDB
        });
    });

});

//Modificar tabla
app.put('/tabla/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    let body = req.body;

    // Busca y actualiza
    // new: true -> Se usa para devolver el nuevo registro
    // runValidators: true -> Ejecuta las validaciones definidas en Mongo
    Tabla.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, tablaDB) => {
        if (err) {
            // 500 bad request
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!tablaDB) {
            // 400 bad request
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            tabla: tablaDB
        });
    });


});

//Borrar tabla 
app.delete('/tabla/:id', [verificaToken, verificaAdmin_Role], (req, res) => {
    let id = req.params.id;

    Tabla.findByIdAndRemove(id, (err, tablaDB) => {
        if (err) {
            // 400 bad request
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!tablaDB) {
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
            message: 'Tabla borrada'
        });

    });

});


module.exports = app;