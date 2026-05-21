import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useInviteMemberMutation } from '../../store/services/boardApi';
import toast from 'react-hot-toast';
import { UserPlus, X, Loader2 } from 'lucide-react';

const MemberList = ({ boardId, members, ownerId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [inviteMember, { isLoading }] = useInviteMemberMutation();
  const onlineMembers = useSelector((state) => state.board.onlineMembers);
  const currentUser = useSelector((state) => state.auth.user);

  const isOwner = currentUser?._id === ownerId;

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      await inviteMember({ boardId, email }).unwrap();
      toast.success('Member invited successfully!');
      setEmail('');
      setIsOpen(false);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to invite member');
    }
  };

  const isUserOnline = (userId) => {
    return onlineMembers.some((om) => om._id === userId);
  };

  return (
    <div className="flex items-center gap-3">
      {/* Avatars of board members */}
      <div className="flex -space-x-2 overflow-hidden">
        {members.map((member) => {
          const online = isUserOnline(member.user._id);
          return (
            <div key={member.user._id} className="relative inline-block">
              <img
                src={member.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.user.name)}`}
                alt={member.user.name}
                title={`${member.user.name} (${member.role}) - ${online ? 'Online' : 'Offline'}`}
                className={`h-8 w-8 rounded-full ring-2 object-cover ${
                  online ? 'ring-emerald-500' : 'ring-dark-900'
                }`}
              />
              {online && (
                <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-dark-950" />
              )}
            </div>
          );
        })}
      </div>

      {isOwner && (
        <button
          onClick={() => setIsOpen(true)}
          className="p-1.5 rounded-lg border border-white/10 hover:border-indigo-500/50 hover:bg-white/5 text-slate-300 hover:text-slate-100 transition-all duration-200"
          title="Invite Member"
        >
          <UserPlus className="w-4 h-4" />
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md glass-panel rounded-2xl p-6 shadow-2xl relative animate-slide-up">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-white/5 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-100 mb-4">Invite Member</h3>
            <p className="text-slate-400 text-xs mb-4">
              Enter the email address of a registered user to invite them to this board.
            </p>

            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <input
                  type="email"
                  placeholder="user@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg glass-input text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-lg font-semibold text-xs border border-white/10 text-slate-300 hover:bg-white/5 hover:text-slate-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg disabled:opacity-50 transition-all"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Inviting...</span>
                    </>
                  ) : (
                    'Send Invitation'
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

export default MemberList;
