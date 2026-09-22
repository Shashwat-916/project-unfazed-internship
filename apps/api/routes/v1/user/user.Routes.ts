import { Router } from 'express';
import { UserController } from './user.Controller';
import { UserService } from './user.Service';
import { authMiddleware } from '../../../middleware/authMiddlware';

const userRouter = Router();

const userService = new UserService();
const userController = new UserController({ userService });

userRouter.post('/login', userController.Login);
userRouter.get('/me', authMiddleware, userController.GetCurrentUser);

export default userRouter;