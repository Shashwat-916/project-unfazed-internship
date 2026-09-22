import { prisma } from "@repo/db";

export class PaymentRepository {

    async GetPaymentByOrderId(orderId: string) {
        return prisma.payment.findUnique({
            where: { gatewayOrderId: orderId },
            include: { appointment: { include: { client: true, therapist: true } } },
        });
    }

    async UpdatePaymentStatus(
        orderId: string,
        paymentId: string,
        signature: string,
        status: "SUCCESS" | "FAILED",
    ) {
        return prisma.payment.update({
            where: { gatewayOrderId: orderId },
            data: {
                gatewayPaymentId: paymentId,
                gatewaySignature: signature,
                status,
            },
        });
    }

    async UpdateAppointmentStatus(
        appointmentId: string,
        status: "CONFIRMED" | "CANCELLED",
    ) {
        return prisma.appointment.update({
            where: { id: appointmentId },
            data: { appointmentStatus: status },
        });
    }

}