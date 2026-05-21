import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validateRequest } from '../../core/middlewares/validateRequest';
import { loginSchema } from './dtos/login.dto';

import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';

const router = Router();
const authRepository = new AuthRepository();
const authService = new AuthService(authRepository);
const authController = new AuthController(authService);

// Login route with validation middleware
router.post('/login', validateRequest(loginSchema), authController.login);

export default router;
