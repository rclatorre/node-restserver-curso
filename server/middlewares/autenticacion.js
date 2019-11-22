const jwt = require('jsonwebtoken');

// =====================
// Verifica token
// =====================
let verificaToken = (req, res, next) => {
    let token = req.get('token');

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

module.exports = {
    verificaToken,
    verificaAdmin_Role
}