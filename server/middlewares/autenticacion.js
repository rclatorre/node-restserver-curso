/*
Revisado        : 05/02/2020
Nota Revision   : Aclarar uso de verificaTokenImg
*/
const jwt = require('jsonwebtoken');

// =====================
// Verifica token
// Carga usuario decodificado del token en req.usuario
// =====================
let verificaToken = (req, res, next) => {
    let token = req.get('x-token');

    jwt.verify(token, process.env.SEED_TOKEN, (err, decoded) => {


        if (err) {
            // 401 no autorizado
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token no valido'
                }
            });
        }

        req.usuario = decoded.usuario; //Coloca usuario en req para que sea usado luego de la llamada al middleware

        next(); // Hace que se ejecute todo lo demas despues de llamar al middleware

    });
}


// =====================
// Verifica AdminRole
// =====================
let verificaAdmin_Role = (req, res, next) => {
    let usuario = req.usuario;

    if (usuario.role === 'ADMIN_ROLE') {
        next(); // Hace que se ejecute todo lo demas despues de llamar al middleware
        return;
    } else {
        // 401 no autorizado
        return res.json({
            ok: false,
            err: {
                message: 'Rol no autorizado'
            }
        });
    }
}


// =====================
// Verifica token para imagen 
// Cuando se tiene que acceder desde una url
// =====================
let verificaTokenImg = (req, res, next) => {
    let token = req.query.token;

    jwt.verify(token, process.env.SEED_TOKEN, (err, decoded) => {
        if (err) {
            // 401 no autorizado
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token no valido'
                }
            });
        }

        req.usuario = decoded.usuario; //Coloca usuario en req para que sea usado luego de la llamada al middleware
        next(); // Hace que se ejecute todo lo demas despues de llamar al middleware

    });
}

module.exports = {
    verificaToken,
    verificaAdmin_Role,
    verificaTokenImg
}