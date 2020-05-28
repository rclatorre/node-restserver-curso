const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const path = require('path');

// Modelos de datos
const Usuario = require('../models/usuario');
//const Producto = require('../models/producto');

// app
const app = express();

// 
app.use(fileUpload({ useTempFiles: true }));

// Carga de imagen 
app.put('/upload/:tipo/:id', (req, res) => {
    let tipo = req.params.tipo; // Tipo: Productos o Usuarios
    let id = req.params.id; // id: dle producto o servicio

    // Si no hay archivos cargados termina
    if (!req.files) {
        return res.status(400)
            .json({
                ok: false,
                err: {
                    message: 'No hay archivos'
                }
            });
    }

    // Validacion de tipos
    let tiposValidos = ['productos', 'usuarios'];

    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400)
            .json({
                ok: false,
                err: {
                    message: 'Los tipos validos son ' + tiposValidos.join(', ')
                }
            });
    }

    // Referencia del archivo cargado
    let archivo = req.files.archivo;
    let nombreCortado = archivo.name.split('.');
    let extension = nombreCortado[nombreCortado.length - 1];
    let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extension) < 0) {
        return res.status(400)
            .json({
                ok: false,
                err: {
                    message: 'Las extensiones validas son ' + extensionesValidas.join(', ')
                }
            });
    }

    // Estructuracion del nombre de archivo
    let nombreArchivo = `${ id }-${new Date().getMilliseconds()}.${extension}`;

    // Mueve el archivo al directorio destino segun el tipo
    archivo.mv(`./uploads/${tipo}/${ nombreArchivo}`, (err) => {
        if (err)
            return res.status(500)
                .json({
                    ok: false,
                    err
                });

        // Funcion independiente para cargar usuarios y productos
        if (tipo === 'usuarios') {
            imagenUsuario(id, res, nombreArchivo);
        } else {
            imagenProducto(id, res, nombreArchivo);
        }
    });

});

// funcion para cargar la imagen del usuario
function imagenUsuario(id, res, nombreArchivo) {

    // Busca al usuario segun el id
    Usuario.findById(id, (err, usuarioDB) => {
        if (err) {
            // Si hay error borra el archivo cargado
            borrarArchivo(nombreArchivo, 'usuarios');

            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!usuarioDB) {
            // Si no existe el usuario borra el archivo cargado
            borrarArchivo(nombreArchivo, 'usuarios');

            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no existe'
                }
            });
        }

        // Borra el archivo anterior asignado al usuario
        borrarArchivo(usuarioDB.img, 'usuarios');

        // Asocia el nombre del nuevo archivo
        usuarioDB.img = nombreArchivo;

        // Graba usuario
        usuarioDB.save((err, usuarioGuardado) => {
            res.json({
                ok: true,
                usuario: usuarioGuardado,
                img: nombreArchivo
            });
        });


    });

}

function imagenProducto(id, res, nombreArchivo) {

    // Producto.findById(id, (err, productoDB) => {
    //     if (err) {
    //         borrarArchivo(nombreArchivo, 'productos');

    //         return res.status(500).json({
    //             ok: false,
    //             err
    //         });
    //     }

    //     if (!productoDB) {
    //         borrarArchivo(nombreArchivo, 'productos');

    //         return res.status(400).json({
    //             ok: false,
    //             err: {
    //                 message: 'Producto no existe'
    //             }
    //         });
    //     }

    //     borrarArchivo(productoDB.img, 'productos');


    //     productoDB.img = nombreArchivo;

    //     productoDB.save((err, productoGuardado) => {
    //         res.json({
    //             ok: true,
    //             producto: productoGuardado,
    //             img: nombreArchivo
    //         });
    //     });


    // });
}

function borrarArchivo(nombreImagen, tipo) {
    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImagen}`);

    if (fs.existsSync(pathImagen)) {
        fs.unlinkSync(pathImagen);
    }
}

module.exports = app;