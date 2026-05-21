import React from 'react';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import MemberList from './MemberList';

const BoardHeader = ({ board, showAnalytics, setShowAnalytics }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6 mb-6">
      <div className="flex items-center gap-3">
        <Link
          to="/boards"
          className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-200"
          title="Back to Workspace"
        >
          <ArrowLeft className="w-4.5 h-4.5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            {board.title}
          </h1>
          <p className="text-slate-400 text-xs mt-0.5 line-clamp-1 max-w-xl">
            {board.description || 'No board description provided.'}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-4 w-full md:w-auto">
        {/* Board Members */}
        <MemberList
          boardId={board._id}
          members={board.members}
          ownerId={board.owner?._id || board.owner}
        />

        {/* Analytics Toggle */}
        <button
          onClick={() => setShowAnalytics(!showAnalytics)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all duration-200 ${
            showAnalytics
              ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20'
              : 'border-white/10 hover:border-white/20 text-slate-300 hover:bg-white/5 hover:text-slate-100'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>{showAnalytics ? 'Hide Stats' : 'Show Stats'}</span>
        </button>
      </div>
    </div>
  );
};

export default BoardHeader;
