import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';

const BoardCard = ({ board }) => {
  const formattedDate = new Date(board.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Link
      to={`/board/${board._id}`}
      className="glass-card rounded-2xl p-6 flex flex-col justify-between hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-500/20 group h-48 relative overflow-hidden transition-all duration-300"
    >
      {/* Premium Top Border Hover Gradient */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div>
        <h3 className="font-bold text-lg text-slate-100 group-hover:text-indigo-400 transition-colors duration-200 line-clamp-1">
          {board.title}
        </h3>
        <p className="text-slate-400 text-sm mt-2 line-clamp-2 leading-relaxed">
          {board.description || 'No description provided.'}
        </p>
      </div>

      <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-auto">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formattedDate}</span>
        </div>

        <div className="flex -space-x-2 overflow-hidden">
          {board.members.slice(0, 4).map((member) => (
            <img
              key={member.user._id}
              src={member.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.user.name)}`}
              alt={member.user.name}
              title={`${member.user.name} (${member.role})`}
              className="inline-block h-6 w-6 rounded-full ring-2 ring-dark-900 object-cover"
            />
          ))}
          {board.members.length > 4 && (
            <div className="flex items-center justify-center h-6 w-6 rounded-full bg-white/10 text-[10px] font-bold text-slate-400 ring-2 ring-dark-900">
              +{board.members.length - 4}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default BoardCard;
