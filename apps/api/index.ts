import express from 'express'
import cors from 'cors'
import { API_PORT } from '../../packages/common'
import { AppError } from './shared/api.error';
import healthRouter from './routes/v1/health/health.Routes';
import authRouter from './routes/v1/auth/auth.Routes';
import userRouter from './routes/v1/user/user.Routes';
import clientRouter from './routes/v1/client/client.Routes';
import therapistRouter from './routes/v1/therapist/therapist.Routes';
import serviceRouter from './routes/v1/services/service.Routes';
import { ErrorMiddleware } from './middleware/error.Middleware';
import { availabilityRouter } from './routes/v1/avalability/avalability.Routes';
import appointmentRouter from './routes/v1/appointment/appointment.Routes';
import paymentRouter from './routes/v1/payment/payment.Routes';
import clientIntakeRouter from './routes/v1/clientIntake/clientIntake.Routes';
import sessionNotesRouter from './routes/v1/sessionNotes/sessionNotes.Routes';
import conversationRouter from './routes/v1/conversation/conversation.Routes';
import messageRouter from './routes/v1/message/message.Routes';
import notificationRouter from './routes/v1/notification/notification.Routes';

import { MinioUpload } from '@repo/minio';

const app = express()
app.use(cors())
app.use(express.json())

app.use("/api/v1", healthRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/client", clientRouter);
app.use("/api/v1/therapist", therapistRouter);
app.use("/api/v1/services", serviceRouter);
app.use('/api/v1/avalability',availabilityRouter);
app.use('/api/v1/appointment', appointmentRouter);
app.use('/api/v1/payment',paymentRouter)
app.use('/api/v1/client-intake', clientIntakeRouter);
app.use('/api/v1/session-notes', sessionNotesRouter);
app.use('/api/v1/conversation', conversationRouter);
app.use('/api/v1/message', messageRouter);
app.use('/api/v1/notification', notificationRouter);

app.use(ErrorMiddleware)

app.listen(API_PORT, async () => {
    try {
        const minioService = new MinioUpload();
        await minioService.initBucket();
    } catch (error) {
        console.error("Failed to initialize MinIO bucket:", error);
    }
    console.log(`server is running on port ${API_PORT}`)
})