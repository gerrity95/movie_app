const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const {
  MAIL_USER,
  MAIL_PASS,
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
    console.log('Email sent sucessfully');
  } catch (error) {
    console.log(error);
    console.log('Email not sent');
  }
};

const sendContactEmail = async (subject, firstName, surname, userEmail, message) => {
  try {
    const htmlMessage = `<br><p>From: ${userEmail}</p><p>Name: ${firstName} ${surname}</p><br>
                    <p>${message}</p>`;
    await transporter.sendMail({
      from: '"What To Watch <info@whattowatchmovies.co>',
      to: 'info@whattowatchmovies.co',
      subject: subject,
      html: htmlMessage,
    });

    console.log('Email sent sucessfully');
  } catch (error) {
    console.log(error);
    console.log('Email not sent');
  }
};


module.exports = {
  transporter: transporter,
  send_email: sendEmail,
  send_contact_email: sendContactEmail,
};
