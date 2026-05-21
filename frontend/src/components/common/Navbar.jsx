import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { logout } from '../../store/slices/authSlice';
import { api } from '../../store/services/api';
import { LogOut, LayoutGrid } from 'lucide-react';
import toast from 'react-hot-toast';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLogoutClick = () => {
    setShowConfirm(true);
  };

  const handleConfirmLogout = () => {
    setShowConfirm(false);
    dispatch(logout());
    dispatch(api.util.resetApiState());
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const handleCancelLogout = () => {
    setShowConfirm(false);
  };

  return (
    <>
      <nav className="glass-panel border-b border-white/5 px-6 py-4 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md">
        <Link to="/boards" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-250">
            <LayoutGrid className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="font-bold text-lg bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
            KanbanSync
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          <ThemeToggle />

          {user && (
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2 sm:gap-3 bg-white/5 rounded-full p-1 sm:pl-2 sm:pr-4 sm:py-1 border border-white/5">
                <img
                  src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`}
                  alt={user.name}
                  className="w-7 h-7 rounded-full border border-white/10 object-cover"
                />
                <div className="hidden sm:flex flex-col">
                  <span className="text-xs font-semibold text-slate-200 leading-tight">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-slate-400 leading-none">
                    {user.email}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogoutClick}
                title="Log Out"
                className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all duration-200"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Premium Custom Logout Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm glass-panel rounded-2xl p-6 shadow-2xl border border-white/5 animate-slide-up">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 border border-rose-500/20 mb-4 animate-pulse">
                <LogOut className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-2">Confirm Log Out</h3>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                Are you sure you want to log out? You will need to log back in to access your boards.
              </p>
              <div className="flex items-center gap-3 w-full">
                <button
                  type="button"
                  onClick={handleCancelLogout}
                  className="flex-1 py-2 px-4 rounded-lg font-semibold text-xs border border-white/10 text-slate-300 hover:bg-white/5 hover:text-slate-100 transition-all duration-250"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmLogout}
                  className="flex-1 py-2 px-4 rounded-lg font-semibold text-xs bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white shadow-lg shadow-rose-500/20 hover:shadow-rose-500/35 active:scale-95 transition-all duration-250"
                >
                  Log Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
