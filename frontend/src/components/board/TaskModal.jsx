import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useAddCommentMutation,
  useAddAttachmentMutation,
  useDeleteAttachmentMutation,
} from '../../store/services/taskApi';
import {
  X,
  Calendar,
  AlertCircle,
  User,
  Paperclip,
  MessageSquare,
  History,
  Trash2,
  Upload,
  Loader2,
  FileText,
  Trash
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useSocket } from '../../hooks/useSocket';

const TaskModal = ({ task, boardId, members, onClose }) => {
  const socket = useSocket();
  const currentUser = useSelector((state) => state.auth.user);
  
  // Real-time typing indicators
  const typingUsers = useSelector((state) => state.board.typingUsers[task._id] || []);
  const otherTypingUsers = typingUsers.filter((u) => u.userId !== currentUser?._id);

  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();
  const [addComment, { isLoading: isCommenting }] = useAddCommentMutation();
  const [addAttachment, { isLoading: isAttaching }] = useAddAttachmentMutation();
  const [deleteAttachment] = useDeleteAttachmentMutation();

  // Local form states
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [priority, setPriority] = useState(task.priority);
  const [dueDate, setDueDate] = useState(task.dueDate ? task.dueDate.split('T')[0] : '');
  const [assignedTo, setAssignedTo] = useState(task.assignedTo?._id || '');
  const [commentText, setCommentText] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Typing timer ref
  const typingTimeoutRef = useRef(null);

  // Sync state with parent props if it changes in real-time
  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description);
    setPriority(task.priority);
    setDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
    setAssignedTo(task.assignedTo?._id || '');
  }, [task]);

  // Clean up typing indicator on unmount
  useEffect(() => {
    return () => {
      stopTyping();
    };
  }, []);

  const startTyping = () => {
    if (socket) {
      socket.emit('typing:start', { boardId, taskId: task._id });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 2000);
  };

  const stopTyping = () => {
    if (socket) {
      socket.emit('typing:stop', { boardId, taskId: task._id });
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleUpdate = async (fields) => {
    try {
      // Pass the current db version to support concurrency last-write-wins checks
      await updateTask({ id: task._id, version: task.version, ...fields }).unwrap();
    } catch (err) {
      if (err.status === 409) {
        toast.error('This task was updated elsewhere. Stale change aborted.');
      } else {
        toast.error('Failed to update task');
      }
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteTask(task._id).unwrap();
      toast.success('Task deleted successfully');
      onClose();
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      await addComment({ taskId: task._id, text: commentText.trim() }).unwrap();
      setCommentText('');
      stopTyping();
    } catch (err) {
      toast.error('Failed to post comment');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      await addAttachment({ taskId: task._id, formData }).unwrap();
      toast.success('File attached successfully');
    } catch (err) {
      toast.error(err?.data?.message || 'File upload failed');
    }
  };

  const handleAttachmentDelete = async (attachmentId) => {
    try {
      await deleteAttachment({ taskId: task._id, attachmentId }).unwrap();
      toast.success('Attachment removed');
    } catch (err) {
      toast.error('Failed to remove attachment');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-4xl glass-panel rounded-2xl p-5 sm:p-6 shadow-2xl relative animate-slide-up flex flex-col md:flex-row gap-6 my-4 md:my-0">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-3.5 top-3.5 sm:right-4 sm:top-4 p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-white/5 transition-all z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left main pane */}
        <div className="flex-1 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => handleUpdate({ title })}
              className="text-xl font-bold bg-transparent border-b border-transparent hover:border-black/10 dark:hover:border-white/10 focus:border-indigo-500 focus:outline-none w-full text-slate-100 py-1"
            />
          </div>

          {/* Real-time typing message banner */}
          {otherTypingUsers.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-indigo-500 dark:bg-indigo-400 animate-ping" />
              <span>
                {otherTypingUsers.map((u) => u.userName).join(', ')} is editing...
              </span>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                startTyping();
              }}
              onBlur={() => {
                handleUpdate({ description });
                stopTyping();
              }}
              placeholder="Add details about this task..."
              rows={4}
              className="w-full px-4 py-2.5 rounded-lg glass-input text-sm resize-none"
            />
          </div>

          {/* Attachments Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Attachments
              </label>
              <label className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold cursor-pointer">
                {isAttaching ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Upload className="w-3.5 h-3.5" />
                )}
                <span>Upload File</span>
                <input type="file" className="hidden" onChange={handleFileUpload} disabled={isAttaching} />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[140px] overflow-y-auto pr-1">
              {task.attachments?.map((attach) => (
                <div
                  key={attach._id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-white/40 dark:bg-white/5 border border-white/10 hover:border-white/20 transition-all"
                >
                  <a
                    href={attach.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 truncate flex-1 pr-2"
                  >
                    <FileText className="w-4 h-4 text-indigo-500 dark:text-indigo-400 shrink-0" />
                    <span className="truncate">{attach.name}</span>
                  </a>
                  <button
                    onClick={() => handleAttachmentDelete(attach._id)}
                    className="p-1 rounded text-slate-500 hover:text-rose-600 dark:hover:text-red-400 hover:bg-white/5"
                  >
                    <Trash className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {(!task.attachments || task.attachments.length === 0) && (
                <div className="sm:col-span-2 text-center py-4 border border-dashed border-white/10 rounded-lg text-xs text-slate-500">
                  No attachments. Upload a file above.
                </div>
              )}
            </div>
          </div>

          {/* Comments Section */}
          <div className="space-y-4">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Comments ({task.comments?.length || 0})
            </label>

            <form onSubmit={handleCommentSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => {
                  setCommentText(e.target.value);
                  startTyping();
                }}
                onBlur={stopTyping}
                className="w-full px-4 py-2.5 rounded-lg glass-input text-xs"
              />
              <button
                type="submit"
                disabled={isCommenting}
                className="px-4 py-2 rounded-lg font-semibold text-xs bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50"
              >
                Comment
              </button>
            </form>

            <div className="space-y-3 max-h-[180px] overflow-y-auto pr-1">
              {task.comments?.map((comment) => (
                <div key={comment._id} className="p-3 rounded-lg bg-white/40 dark:bg-white/5 border border-white/10 flex gap-2.5">
                  <img
                    src={comment.author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.author?.name || 'User')}`}
                    alt={comment.author?.name}
                    className="w-6 h-6 rounded-full object-cover shrink-0 mt-0.5"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-300">{comment.author?.name}</span>
                      <span className="text-[9px] text-slate-500">
                        {new Date(comment.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right properties panel */}
        <div className="w-full md:w-64 space-y-6 md:border-l md:border-white/10 md:pl-6">

          {/* Properties grid */}
          <div className="space-y-4 pt-4 md:pt-0">
            {/* Assignee */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Assignee
              </label>
              <div className="relative">
                <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <select
                  value={assignedTo}
                  onChange={(e) => {
                    setAssignedTo(e.target.value);
                    handleUpdate({ assignedTo: e.target.value || null });
                  }}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg glass-input text-xs"
                >
                  <option value="">Unassigned</option>
                  {members.map((member) => (
                    <option key={member.user._id} value={member.user._id}>
                      {member.user.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Priority
              </label>
              <div className="relative">
                <AlertCircle className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <select
                  value={priority}
                  onChange={(e) => {
                    setPriority(e.target.value);
                    handleUpdate({ priority: e.target.value });
                  }}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg glass-input text-xs uppercase"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Due Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => {
                    setDueDate(e.target.value);
                    handleUpdate({ dueDate: e.target.value || null });
                  }}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg glass-input text-xs"
                />
              </div>
            </div>
          </div>

          {/* Activity Logs timelines */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5" />
              <span>Activity Timeline</span>
            </h4>
            <div className="space-y-3 max-h-[180px] overflow-y-auto pr-1">
              {task.activityLogs?.map((log) => (
                <div key={log._id} className="text-[11px] leading-relaxed text-slate-400 flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-600 mt-1.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-300">{log.user?.name || 'Someone'}</span>{' '}
                    <span>{log.text}</span>
                    <span className="block text-[9px] text-slate-600 mt-0.5">
                      {new Date(log.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-white/5">
            {showDeleteConfirm ? (
              <div className="space-y-2 p-3 rounded-xl bg-rose-500/5 border border-rose-500/20 animate-fade-in">
                <p className="text-[11px] text-rose-400 font-semibold text-center leading-normal">
                  Permanently delete this task?
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCancelDelete}
                    className="flex-1 py-1.5 rounded-lg border border-white/10 text-[10px] font-bold text-slate-300 hover:bg-white/5 hover:text-slate-100 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDelete}
                    className="flex-1 py-1.5 rounded-lg bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-[10px] font-bold text-white transition-all duration-200 shadow-md shadow-rose-500/10"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleDeleteClick}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 hover:text-red-300 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Task</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default TaskModal;
