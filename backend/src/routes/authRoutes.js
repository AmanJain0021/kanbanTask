import express from 'express';
import { registerUser, loginUser, getMe } from '../controllers/authController.js';
import { validate } from '../middlewares/validatorMiddleware.js';
import { registerSchema, loginSchema } from '../validators/authValidator.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', validate(registerSchema), registerUser);
router.post('/login', validate(loginSchema), loginUser);
router.get('/me', protect, getMe);

export default router;
