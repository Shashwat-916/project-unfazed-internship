import express from 'express'
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

const app = express()
app.use(express.json())

app.use("/api/v1", healthRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/client", clientRouter);
app.use("/api/v1/therapist", therapistRouter);
app.use("/api/v1/services", serviceRouter);
app.use('/api/v1/avalability',availabilityRouter)

app.use(ErrorMiddleware)

app.listen(API_PORT,()=>{
     console.log(`server is running on port ${API_PORT}`)
})