//=======
// Puerto
//=======
process.env.PORT = process.env.PORT || 3000;

//=======
// Entorno
//=======
process.env.MODE_ENV = process.env.MODE_ENV || 'dev';

//=======
// Vencimiento del token
//=======
// 60 segundos
// 60 minutos
// 24 horas
// 30 dias
process.env.CADUCIDAD_TOKEN = 60 * 60 * 24 * 30;


//=======
// Seed del token
//=======
// En heroku debe estar declarada esta variable, de esta forma no es visible en github 
// Comando para crear la variable: heroku config:set SEED_TOKEN='este-es-el-seed-desarrollo'
process.env.SEED_TOKEN = process.env.SEED_TOKEN || 'este-es-el-seed-desarrollo';

//=======
// DB
//=======
let urlDB;

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    // En heroku debe estar declarada esta variable, de esta forma no es visible en github 
    // Comando para crear la variable: heroku config:set MONGO_URI='mongodb+srv://strider:123@cluster0-7hqtd.mongodb.net/cafe'    
    urlDB = process.env.MONGO_URI;
}

process.env.URLDB = urlDB;


//=======
// Google cliente id
// Se creara en Heroku una variable
//=======
process.env.CLIENT_ID = process.env.CLIENT_ID || '138552712854-ula9ge8ud9n7l4mh1dq8jnvfn2tnp1kk.apps.googleusercontent.com';