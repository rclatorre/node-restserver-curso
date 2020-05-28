const express = require('express');
const Cotizacion = require('../models/cotizacion'); //Mayuscula pq desde aqui crearemos instancias con new....
const _ = require('underscore');

const { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion');

const app = express();

// -------
// Metodos
// -------

//Mostrar cotizacion por termino p.e.: USD/EUR
//verificaToken,
// Buscar
//verificaToken,
app.get('/cotizacion/buscar/:termino', (req, res) => {

    let termino = req.params.termino;

    let regex = new RegExp(termino, 'i');

    Cotizacion.find({ codigo: regex })
        .exec((err, cotizacion) => {
            if (err) {
                // 400 bad request
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (!cotizacion) {
                // 400 bad request
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                cotizacion
            });
        })
});



//Actualizar cotizaciones
//verificaToken,
app.post('/cotizacion/actualiza', (req, res) => {
    let body = req.body;

    console.log(body);

    /*
    var arr = [{ name: 'Star Wars' }, { name: 'The Empire Strikes Back' }];
Movies.insertMany(arr, function(error, docs) {});
*/

    //var arr = [{ codigo: 'USD/EUR', cotizacion: '0.8125' }, { codigo: 'The Empire Strikes Back' }];

    Cotizacion.remove((err, cotizacionDB) => {

    });

    // Busca y actualiza
    // new: true -> Se usa para devolver el nuevo registro
    // runValidators: true -> Ejecuta las validaciones definidas en Mongo
    Cotizacion.insertMany(body, (err, cotizacionDB) => {
        if (err) {
            // 500 bad request
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!cotizacionDB) {
            // 400 bad request
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            cotizacion: cotizacionDB
        });
    });


});



module.exports = app;