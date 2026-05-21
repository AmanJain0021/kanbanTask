import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskCard from './TaskCard';
import { Plus, X, Loader2 } from 'lucide-react';
import { useCreateTaskMutation } from '../../store/services/taskApi';
import toast from 'react-hot-toast';

const Column = ({ status, title, tasks, onTaskClick, boardId }) => {
  const { setNodeRef } = useDroppable({ id: status });
  const [createTask, { isLoading }] = useCreateTaskMutation();
  const [isAdding, setIsAdding] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    try {
      await createTask({
        title: taskTitle.trim(),
        status,
        boardId,
      }).unwrap();
      setTaskTitle('');
      setIsAdding(false);
    } catch (err) {
      toast.error('Failed to create task');
    }
  };

  return (
    <div className="flex flex-col glass-column rounded-xl w-72 max-h-[75vh] overflow-hidden">
      {/* Column Header */}
      <div className="flex items-center justify-between px-4 py-3.5 glass-column-header">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            status === 'todo' ? 'bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.7)]' :
            status === 'in-progress' ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.7)]' :
            status === 'review' ? 'bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.7)]' : 
            'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]'
          }`} />
          <h3 className="font-bold text-slate-200 text-sm tracking-tight">{title}</h3>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/10 text-[10px] text-slate-400 font-bold">
          {tasks.length}
        </span>
      </div>

      {/* Tasks List Container */}
      <div
        ref={setNodeRef}
        className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[150px]"
      >
        <SortableContext
          items={tasks.map((t) => t._id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <TaskCard key={task._id} task={task} onClick={onTaskClick} />
          ))}
        </SortableContext>
      </div>

      {/* Bottom Action Area */}
      <div className="p-3 glass-column-footer">
        {isAdding ? (
          <form onSubmit={handleSubmit} className="space-y-2 animate-fade-in">
            <input
              type="text"
              placeholder="Enter task title..."
              autoFocus
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg glass-input text-xs"
            />
            <div className="flex items-center justify-end gap-1.5">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="p-1.5 rounded-lg border border-white/10 text-slate-400 hover:text-slate-100 hover:bg-white/5 transition-all"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  'Add'
                )}
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed border-white/10 hover:border-indigo-500/30 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-500/5 dark:hover:bg-indigo-500/5 transition-all text-xs font-medium"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default Column;
