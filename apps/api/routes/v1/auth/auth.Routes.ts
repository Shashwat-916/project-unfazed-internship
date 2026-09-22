import { Router } from "express";

const authRouter = Router();

authRouter.post('/send-otp', ()=> {});
authRouter.post('/verify-otp', ()=> {});
authRouter.post('/register/client', ()=>{});
authRouter.post('/register/therapist', ()=>{});

export default authRouter;