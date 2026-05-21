import express from 'express';
import { createBoard, getBoards, getBoardById, inviteMember } from '../controllers/boardController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validatorMiddleware.js';
import { createBoardSchema, inviteMemberSchema } from '../validators/boardValidator.js';

const router = express.Router();

// Apply auth protection to all board routes
router.use(protect);

router.post('/', validate(createBoardSchema), createBoard);
router.get('/', getBoards);
router.get('/:id', getBoardById);
router.post('/:id/invite', validate(inviteMemberSchema), inviteMember);

export default router;
