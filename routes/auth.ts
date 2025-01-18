import express from 'express';
import { validateRequest } from '../middleware/validateRequest';
import { loginSchema, adminSchema } from '../validations/schemas';
import { login, refreshToken, register } from '../controllers/authController';
const router = express.Router();

router.post('/register', validateRequest(adminSchema),  register);
router.post('/login', validateRequest(loginSchema), login);
router.post('/refresh-token', refreshToken);

export default router;
