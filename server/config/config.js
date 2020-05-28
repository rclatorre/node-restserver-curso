//=======
// Puerto
//=======
process.env.PORT = process.env.PORT || 3000;

//=======
// Entorno
//=======
process.env.NODE_ENV = process.env.MODE_ENV || 'dev';

//=======
// Vencimiento del token
//=======
// 60 segundos
// 60 minutos
// 24 horas
// 30 dias
// process.env.CADUCIDAD_TOKEN = 60 * 60 * 24 * 30;
process.env.CADUCIDAD_TOKEN = '1d';
process.env.CADUCIDAD_TOKEN_REGISTRO = '1h';
process.env.CADUCIDAD_TOKEN_RECUPERACION = '1h';

//=======
// Seed del token
//=======
// En heroku debe estar declarada esta variable, de esta forma no es visible en github 
/*
    Comando para crear la variable: 
    heroku config:set SEED_TOKEN='este-es-el-seed-change2go'
    estado: creada
*/
process.env.SEED_TOKEN = process.env.SEED_TOKEN || 'este-seed-es-de-divisa-2020';

//=======
// DB
//=======
let urlDB;

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/divisa_change2go';
    // urlDB = 'mongodb+srv://strider:123@cluster0-7hqtd.mongodb.net/divisa_change2Go';
} else {
    // En heroku debe estar declarada esta variable, de esta forma no es visible en github 
    /*
        Comando para crear la variable: 
        heroku config:set MONGO_URI='mongodb+srv://striderChange2go:123@cluster0-laqtw.mongodb.net/divisa_change2go'    
        estado: creada
    */
    urlDB = process.env.MONGO_URI;
}

process.env.URLDB = urlDB;

 
//=======
// Google cliente id
// Se creara en Heroku una variable
//=======
process.env.CLIENT_ID = process.env.CLIENT_ID || '138552712854-ula9ge8ud9n7l4mh1dq8jnvfn2tnp1kk.apps.googleusercontent.com';

// process.env.URLFront = 'http://c1761019.ferozo.com';
/*
    Comando para crear la variable: 
    heroku config:set URLFront='http://c1301399.ferozo.com'    
    estado: creada
*/
process.env.URLFront = process.env.URLFront || 'http://localhost:8100';