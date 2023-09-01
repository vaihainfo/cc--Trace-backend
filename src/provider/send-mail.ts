import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    logger: true
});

const sendForgotEmail = (link: any, email: string) => {
    const message = {
        from: process.env.SENDER_EMAIL_ADDRESS,
        to: email,
        subject: 'Reset Password',
        text: `To reset your password, please click the link below.\n\n ${link}`
    };

    //send email
    transporter.sendMail(message, function (err, info) {
        if (err) { console.log(err) }
        else { console.log('sent'); }
    });
}

export { sendForgotEmail }