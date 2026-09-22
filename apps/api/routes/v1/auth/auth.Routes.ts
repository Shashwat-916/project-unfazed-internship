import { Router } from "express";
import { AuthController } from "./auth.Controller";
import { AuthService } from "./auth.service";
import { AuthRespository } from "./auth.Respository";

const authRouter = Router();
const authRespository = new AuthRespository();
const authService = new AuthService();
const auth = new AuthController({ authRespository, authService });

authRouter.post('/send-otp', auth.SendOtp);
authRouter.post('/verify-otp', auth.VerifyOtp);
authRouter.post('/register/client', auth.RegisterClient);
authRouter.post('/register/therapist', auth.RegisterTherapist);

export default authRouter;