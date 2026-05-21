import express from 'express';
import {
  createTask,
  getBoardTasks,
  updateTask,
  deleteTask,
  addComment,
  addAttachment,
  deleteAttachment,
} from '../controllers/taskController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validatorMiddleware.js';
import { createTaskSchema, updateTaskSchema, createCommentSchema } from '../validators/taskValidator.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = express.Router();

// Protect all task endpoints
router.use(protect);

router.post('/', validate(createTaskSchema), createTask);
router.get('/board/:boardId', getBoardTasks);
router.put('/:id', validate(updateTaskSchema), updateTask);
router.delete('/:id', deleteTask);
router.post('/:id/comments', validate(createCommentSchema), addComment);
router.post('/:id/attachments', upload.single('file'), addAttachment);
router.delete('/:id/attachments/:attachmentId', deleteAttachment);

export default router;
