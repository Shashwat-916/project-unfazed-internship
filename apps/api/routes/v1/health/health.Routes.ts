import { Router } from 'express';
import { HealthController } from './health.Controller';


const health = new HealthController();
const healthRouter = Router();
healthRouter.get('/health',health.GetHealth)

export default healthRouter