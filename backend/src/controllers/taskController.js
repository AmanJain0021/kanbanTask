import Task from '../models/Task.js';
import Board from '../models/Board.js';
import { uploadFile, deleteFile } from '../services/uploadService.js';

// Helper to log activities
const logActivity = (task, text, userId, action) => {
  task.activityLogs.push({
    text,
    user: userId,
    action,
    createdAt: new Date(),
  });
};

export const createTask = async (req, res, next) => {
  try {
    const { title, description, priority, dueDate, assignedTo, status, boardId } = req.body;

    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ success: false, message: 'Board not found' });
    }

    // Get max position in column to append task at end
    const lastTask = await Task.findOne({ boardId, status: status || 'todo' })
      .sort({ position: -1 });

    const position = lastTask ? lastTask.position + 1000 : 1000;

    const task = new Task({
      title,
      description,
      priority,
      dueDate,
      assignedTo: assignedTo || null,
      status: status || 'todo',
      position,
      boardId,
    });

    logActivity(task, `created this task`, req.user._id, 'create');
    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email avatar')
      .populate('comments.author', 'name email avatar')
      .populate('activityLogs.user', 'name email avatar');

    // Emit Socket.io event for real-time creation
    if (req.io) {
      req.io.to(boardId.toString()).emit('task:create', populatedTask);
    }

    res.status(201).json({
      success: true,
      data: populatedTask,
    });
  } catch (error) {
    next(error);
  }
};

export const getBoardTasks = async (req, res, next) => {
  try {
    const { boardId } = req.params;

    const tasks = await Task.find({ boardId })
      .populate('assignedTo', 'name email avatar')
      .populate('comments.author', 'name email avatar')
      .populate('activityLogs.user', 'name email avatar')
      .sort({ position: 1 });

    res.json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Concurrency check (stale state prevention)
    if (updates.version !== undefined && updates.version < task.version) {
      return res.status(409).json({
        success: false,
        message: 'Stale state: Task has been updated by another user.',
        data: await Task.findById(id)
          .populate('assignedTo', 'name email avatar')
          .populate('comments.author', 'name email avatar')
          .populate('activityLogs.user', 'name email avatar'),
      });
    }

    // Check if status is moving
    const isMovement = (updates.status && updates.status !== task.status) || updates.position !== undefined;

    // Log movement/updates
    if (updates.status && updates.status !== task.status) {
      logActivity(
        task,
        `moved task from ${task.status} to ${updates.status}`,
        req.user._id,
        'move'
      );
      task.status = updates.status;
    }

    if (updates.position !== undefined) {
      task.position = updates.position;
    }

    // Other updates
    const loggableFields = ['title', 'description', 'priority', 'dueDate', 'assignedTo'];
    let changed = false;

    for (const field of loggableFields) {
      if (updates[field] !== undefined && String(updates[field]) !== String(task[field])) {
        if (field === 'assignedTo') {
          logActivity(task, `changed assignee`, req.user._id, 'assign');
        } else {
          logActivity(task, `updated ${field}`, req.user._id, 'update');
        }
        task[field] = updates[field];
        changed = true;
      }
    }

    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email avatar')
      .populate('comments.author', 'name email avatar')
      .populate('activityLogs.user', 'name email avatar');

    // Emit Socket.io events
    if (req.io) {
      const room = task.boardId.toString();
      if (isMovement) {
        req.io.to(room).emit('task:move', populatedTask);
      } else {
        req.io.to(room).emit('task:update', populatedTask);
      }
    }

    res.json({
      success: true,
      data: populatedTask,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const boardId = task.boardId.toString();

    // Delete associated files
    if (task.attachments && task.attachments.length > 0) {
      for (const attach of task.attachments) {
        await deleteFile(attach.publicId, attach.url);
      }
    }

    await Task.findByIdAndDelete(id);

    // Emit Socket.io delete event
    if (req.io) {
      req.io.to(boardId).emit('task:delete', { taskId: id, boardId });
    }

    res.json({
      success: true,
      message: 'Task deleted successfully',
      taskId: id,
    });
  } catch (error) {
    next(error);
  }
};

export const addComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const comment = {
      text,
      author: req.user._id,
      createdAt: new Date(),
    };

    task.comments.push(comment);
    logActivity(task, `added comment: "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`, req.user._id, 'comment');
    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email avatar')
      .populate('comments.author', 'name email avatar')
      .populate('activityLogs.user', 'name email avatar');

    // Emit Socket.io update event
    if (req.io) {
      req.io.to(task.boardId.toString()).emit('task:update', populatedTask);
    }

    res.json({
      success: true,
      data: populatedTask,
    });
  } catch (error) {
    next(error);
  }
};

export const addAttachment = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const uploadResult = await uploadFile(req.file);

    const attachment = {
      url: uploadResult.url,
      publicId: uploadResult.publicId,
      name: req.file.originalname,
      size: req.file.size,
      mimeType: req.file.mimetype,
      createdAt: new Date(),
    };

    task.attachments.push(attachment);
    logActivity(task, `attached file "${req.file.originalname}"`, req.user._id, 'attachment');
    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email avatar')
      .populate('comments.author', 'name email avatar')
      .populate('activityLogs.user', 'name email avatar');

    // Emit Socket.io update event
    if (req.io) {
      req.io.to(task.boardId.toString()).emit('task:update', populatedTask);
    }

    res.json({
      success: true,
      data: populatedTask,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAttachment = async (req, res, next) => {
  try {
    const { id, attachmentId } = req.params;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const attachment = task.attachments.id(attachmentId);
    if (!attachment) {
      return res.status(404).json({ success: false, message: 'Attachment not found' });
    }

    // Delete actual file
    await deleteFile(attachment.publicId, attachment.url);

    // Remove from array
    task.attachments.pull(attachmentId);
    logActivity(task, `removed attachment "${attachment.name}"`, req.user._id, 'attachment_delete');
    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email avatar')
      .populate('comments.author', 'name email avatar')
      .populate('activityLogs.user', 'name email avatar');

    // Emit Socket.io update event
    if (req.io) {
      req.io.to(task.boardId.toString()).emit('task:update', populatedTask);
    }

    res.json({
      success: true,
      data: populatedTask,
    });
  } catch (error) {
    next(error);
  }
};
