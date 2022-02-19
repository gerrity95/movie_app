const nodemailer = require("nodemailer");
const dotenv = require('dotenv');
dotenv.config();

const {
    MAIL_HOST,
    MAIL_PORT,
    MAIL_USER,
    MAIL_PASS
  } = process.env;

  
const transporter = nodemailer.createTransport({
    service: 'Godaddy',
    auth: {
      user: MAIL_USER, // generated ethereal user
      pass: MAIL_PASS, // generated ethereal password
    },
  });

const sendEmail = async (email, subject, text) => {
    try {
        
        await transporter.sendMail({
            from: '"What To Watch <info@whattowatchmovies.co>',
            to: email,
            subject: subject,
            html: text,
        });

        console.log("email sent sucessfully");
    } catch (error) {
        console.log(error, "email not sent");
    }
};

const sendContactEmail = async (subject, first_name, surname, user_email, message) => {
  try {
      html_message = `<br><p>From: ${user_email}</p><p>Name: ${first_name} ${surname}</p><br>
                      <p>${message}</p>`
      await transporter.sendMail({
          from: '"What To Watch <info@whattowatchmovies.co>',
          to: 'info@whattowatchmovies.co',
          subject: subject,
          html: html_message,
      });

      console.log("email sent sucessfully");
  } catch (error) {
      console.log(error, "email not sent");
  }
};


  module.exports = {
    transporter: transporter,
    send_email: sendEmail,
    send_contact_email: sendContactEmail
  }