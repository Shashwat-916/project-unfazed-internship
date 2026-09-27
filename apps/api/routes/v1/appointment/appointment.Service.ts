import type { DaysOfWeek } from "@repo/types";
import { PaymentService } from "../payment/payment.Service";
import { prisma } from "@repo/db";




export class AppointmentService {

    private razorpay: PaymentService

    constructor(razorpay: PaymentService) {
        this.razorpay = razorpay
    }

    async BookAppointMentEnrich(
        clientId: string,
        serviceId: string,
        therapistId: string,
        price: number,
        date: Date,
        day: DaysOfWeek,
        timeSlotId: number,
        startTime: Date,
        endTime: Date
    ) {

        const lockKey = `lock:appointment:${therapistId}:${clientId}:${timeSlotId}${price}:${serviceId}`;
        const lockAcquired = await this.razorpay.AquireLock(lockKey, clientId, 600000);
        if (!lockAcquired) {
            throw new Error("Time slot is currently reserved by another user.")
        }

        try {
            const orderAmountPaise = price * 100;
            const receiptId = `receipt_${Date.now()}`;
            const razorpayOrder =  await this.razorpay.createOrder(orderAmountPaise, receiptId);

            const appointment = await prisma.appointment.create({
                data: {
                    clientId,
                    therapistId,
                    serviceId,
                    startTime,
                    endTime,
                    totalAmount: price,
                    payment: {
                        create: {
                            gatewayOrderId: razorpayOrder.id,
                            amount: price,
                        }
                    }
                },
                include: { payment: true }
            });

            await prisma.bookedAppointment.create({
                data: {
                    therapistId,
                    date,
                    month: date.getMonth() + 1,
                    startTime,
                    endTime
                }
            });

            return appointment;
        }
        catch (e) {
              await this.razorpay.ReleaseLock(lockKey, clientId);
              console.log("Error while razorpay payment ", e);
              throw e;
        }
    }
}


