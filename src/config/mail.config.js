import nodemailer from "nodemailer"

export const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: "rashidpanhwer8@gmail.com",
        pass: "abdzpbuxvwmzjyja"
    }
    // host: process.env.SMTP_HOST,
    // port: process.env.SMTP_PORT,
    // secure: process.env.SMTP_SECURE,
    // auth: {
    //     user: process.env.SMTP_USER,
    //     pass: process.env.SMTP_PASS
    // }
})

export default transporter