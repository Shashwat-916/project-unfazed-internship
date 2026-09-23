
import { SMTP_HOST, SMTP_PASS, SMTP_PORT, SMTP_USER } from "@repo/common"
import nodemailer, { type Transporter } from 'nodemailer'
import { EMAIL_OTP_TEMPLATE } from './template'


export const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) == 465,
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
    }
})

transporter.verify().then(() => { console.log('SMTP connected Successfully') }).catch((error) => { console.error(error) })

export class NodeMailerService {

    private transporter: Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: SMTP_HOST,
            port: Number(SMTP_PORT),
            secure: Number(SMTP_PORT) == 465,
            auth: {
                user: SMTP_USER,
                pass: SMTP_PASS
            }
        })

        this.transporter.verify().then(() => { console.log('SMTP connected Successfully') }).catch((error) => { console.error(error) })
    }

    async SendOTP(email: string, otp: string) {
        try {
            const name = email.split('@')[0];
            const htmlContent = EMAIL_OTP_TEMPLATE(name!, otp);
            const information = await this.transporter.sendMail({
                from: `Unfazed App <${SMTP_USER}>`,
                to: email,
                subject: "Your Unfazed Verification Code",
                html: htmlContent
            })

            console.log(`Email sent successfully to ${email} with message ID ${information.messageId}`)

        } catch (e) {
            console.error(`Error While Sending EMAIL to the USER ${email}`)
        }
    }
}