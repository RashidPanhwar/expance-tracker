import transporter from "../config/mail.config.js";

export const sendMail = async ({
    to,
    subject,
    html,
    text = ""
}) => {
    try {
        const info = await transporter.sendMail({
            from: process.env.MAIL_FROM,
            to,
            subject,
            html,
            text
        })

        return info
    } catch (error) {
        throw new Error("Unable to send Email");
    }
}