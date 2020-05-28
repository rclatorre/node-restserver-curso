const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');

class Email {
    constructor(oConfig) {
        this.createTransport = nodemailer.createTransport(oConfig);
        this.createTransport.use('compile', hbs({
            viewEngine: 'express-handlebars',
            viewPath: '../views/'
        }));

        console.log(this.createTransport);

    }

    enviarCorreo(oEmail) {
        try {
            this.createTransport.sendMail(oEmail, function(error, info) {
                if (error) {
                    console.log('Error al enviar email');
                } else {
                    console.log('Correo enviado correctamente');
                }
                this.createTransport.close();
            })

        } catch (x) {
            console.log('Email.enviarCorrero -- Error-- ') + x;
        }
    }

}

module.exports = Email;