import nodemailer from "nodemailer";
import "dotenv/config";
export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    // TODO: replace `user` and `pass` values from <https://forwardemail.net>
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async (tomail, subject, body) => {
  const info = await transporter.sendMail({
    from: process.env.FROM_EMAIL, // sender address
    to: tomail, // list of receivers
    subject: subject, // Subject line
    html: body, // html body
  });
};
