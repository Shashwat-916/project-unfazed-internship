import nodemailer, { type Transporter } from 'nodemailer'

import { PAYMENT_SUCCESS_THERAPIST_TEMPLATE } from './template'
import { SMTP_HOST, SMTP_PASS, SMTP_PORT, SMTP_USER } from '@repo/common';

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

    async SendPaymentSuccess(email: string, name: string, appointmentDate: string, amount: string, clientName: string) {
        try {
            const htmlContent = PAYMENT_SUCCESS_THERAPIST_TEMPLATE(name, appointmentDate, amount, clientName);
            const information = await this.transporter.sendMail({
                from: `Unfazed App <${SMTP_USER}>`,
                to: email,
                subject: "New Booking Received - Payment Successful",
                html: htmlContent
            })

            console.log(`Email sent successfully to ${email} with message ID ${information.messageId}`)

        } catch (e) {
            console.error(`Error While Sending EMAIL to the USER ${email}`, e)
        }
    }
}
