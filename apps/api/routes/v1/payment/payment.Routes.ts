import { Router } from "express";
import { authMiddleware } from "../../../middleware/authMiddlware";


export const paymentRouter = Router()

paymentRouter.post('/verify',authMiddleware)

export default paymentRouter