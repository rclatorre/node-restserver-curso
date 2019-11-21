//=======
// Puerto
//=======
process.env.PORT = process.env.PORT || 3000;

//=======
// Entorno
//=======
process.env.MODE_ENV = process.env.MODE_ENV || 'dev';

//=======
// DB
//=======
let urlDB;

if (process.env.MODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    urlDB = 'mongodb+srv://strider:123@cluster0-7hqtd.mongodb.net/cafe';
}

process.env.URLDB = urlDB;