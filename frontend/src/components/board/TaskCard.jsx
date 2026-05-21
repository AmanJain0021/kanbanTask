import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MessageSquare, Paperclip, Calendar, User } from 'lucide-react';

const TaskCard = ({ task, onClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priorityColors = {
    high: 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20',
    medium: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
    low: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';
  const isDueToday = task.dueDate && new Date(task.dueDate).toDateString() === new Date().toDateString() && task.status !== 'done';

  const formattedDueDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(task)}
      className={`glass-card rounded-lg p-4 cursor-grab active:cursor-grabbing select-none relative group shadow-md ${
        isDragging ? 'opacity-30 border border-dashed border-indigo-500' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${
            priorityColors[task.priority]
          }`}
        >
          <span className="w-1 h-1 rounded-full bg-current shrink-0" />
          <span>{task.priority}</span>
        </span>
      </div>

      <h4 className="font-semibold text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors text-sm leading-snug line-clamp-2">
        {task.title}
      </h4>

      {task.description && (
        <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10 text-[11px] text-slate-400">
        <div className="flex items-center gap-3">
          {formattedDueDate && (
            <div
              className={`flex items-center gap-1 font-medium ${
                isOverdue
                  ? 'text-rose-600 dark:text-rose-400 font-bold'
                  : isDueToday
                  ? 'text-amber-600 dark:text-amber-400 font-bold'
                  : 'text-slate-400'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{formattedDueDate}</span>
            </div>
          )}

          {(task.comments?.length > 0 || task.attachments?.length > 0) && (
            <div className="flex items-center gap-2.5 text-slate-500">
              {task.comments?.length > 0 && (
                <div className="flex items-center gap-0.5" title={`${task.comments.length} comments`}>
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{task.comments.length}</span>
                </div>
              )}
              {task.attachments?.length > 0 && (
                <div className="flex items-center gap-0.5" title={`${task.attachments.length} attachments`}>
                  <Paperclip className="w-3.5 h-3.5" />
                  <span>{task.attachments.length}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {task.assignedTo ? (
          <img
            src={task.assignedTo.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(task.assignedTo.name)}`}
            alt={task.assignedTo.name}
            title={`Assigned to ${task.assignedTo.name}`}
            className="w-5.5 h-5.5 rounded-full object-cover border border-white/10"
          />
        ) : (
          <div className="w-5.5 h-5.5 rounded-full bg-white/10 flex items-center justify-center border border-dashed border-white/10 text-slate-500" title="Unassigned">
            <User className="w-3 h-3" />
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
