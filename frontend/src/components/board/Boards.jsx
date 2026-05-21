import React, { useState } from 'react';
import { useGetBoardsQuery, useCreateBoardMutation } from '../../store/services/boardApi';
import BoardCard from './BoardCard';
import Navbar from '../common/Navbar';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Plus, X, FolderOpen, Loader2 } from 'lucide-react';

const boardSchema = z.object({
  title: z.string().min(1, 'Board title is required').max(100, 'Title cannot exceed 100 characters').trim(),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional().default(''),
});

const Boards = () => {
  const { data: boardsData, isLoading: isFetching, refetch } = useGetBoardsQuery();
  const [createBoard, { isLoading: isCreating }] = useCreateBoardMutation();
  const [isOpen, setIsOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(boardSchema),
    defaultValues: { title: '', description: '' },
  });

  const onSubmit = async (data) => {
    try {
      await createBoard(data).unwrap();
      toast.success('Board created successfully!');
      reset();
      setIsOpen(false);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to create board');
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 text-slate-100 pb-12">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-10 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
              My Workspace
            </h1>
            <p className="text-slate-400 text-sm mt-1">Manage and collaborate on your team projects</p>
          </div>

          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-semibold text-sm text-white shadow-lg shadow-indigo-600/15 hover:shadow-indigo-500/25 transition-all duration-200 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create Board</span>
          </button>
        </div>

        {isFetching ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass-card rounded-xl p-6 h-48 animate-pulse flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="h-5 w-2/3 bg-white/10 rounded"></div>
                  <div className="h-4 w-5/6 bg-white/5 rounded"></div>
                  <div className="h-4 w-4/5 bg-white/5 rounded"></div>
                </div>
                <div className="h-6 w-1/3 bg-white/10 rounded border-t border-white/5 pt-4"></div>
              </div>
            ))}
          </div>
        ) : !boardsData?.data || boardsData.data.length === 0 ? (
          <div className="glass-panel border-white/5 rounded-2xl p-16 text-center max-w-xl mx-auto mt-12">
            <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-5 text-indigo-400 border border-white/10">
              <FolderOpen className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-200">No boards found</h3>
            <p className="text-slate-400 text-sm mt-2 max-w-md mx-auto">
              You haven't created or been invited to any boards yet. Create a new board above to start managing your tasks!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boardsData.data.map((board) => (
              <BoardCard key={board._id} board={board} />
            ))}
          </div>
        )}
      </main>

      {/* Creation Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg glass-panel rounded-2xl p-6 shadow-2xl relative border border-white/5 animate-slide-up">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-white/5 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-slate-100 mb-6">Create New Board</h3>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Board Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Project Apollo"
                  className={`w-full px-4 py-2.5 rounded-lg glass-input text-sm ${
                    errors.title ? 'border-red-500/50 focus:border-red-500' : ''
                  }`}
                  {...register('title')}
                />
                {errors.title && (
                  <p className="text-xs text-red-400 mt-1.5">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Description
                </label>
                <textarea
                  placeholder="Provide a brief summary of the workspace goals..."
                  rows={4}
                  className={`w-full px-4 py-2.5 rounded-lg glass-input text-sm resize-none ${
                    errors.description ? 'border-red-500/50 focus:border-red-500' : ''
                  }`}
                  {...register('description')}
                />
                {errors.description && (
                  <p className="text-xs text-red-400 mt-1.5">{errors.description.message}</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-lg font-semibold text-sm border border-white/10 text-slate-300 hover:bg-white/5 hover:text-slate-100 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg disabled:opacity-50 transition-all duration-200"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    'Create Board'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Boards;
