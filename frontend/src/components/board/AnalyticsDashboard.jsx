import React from 'react';
import { BarChart3, Users, CheckCircle2, ListTodo, ClipboardList, Clock } from 'lucide-react';

const AnalyticsDashboard = ({ tasks, members }) => {
  // Aggregate statistics
  const total = tasks.length;
  const todo = tasks.filter((t) => t.status === 'todo').length;
  const inProgress = tasks.filter((t) => t.status === 'in-progress').length;
  const review = tasks.filter((t) => t.status === 'review').length;
  const done = tasks.filter((t) => t.status === 'done').length;

  const doneRate = total > 0 ? Math.round((done / total) * 100) : 0;

  // Priority breakdown
  const low = tasks.filter((t) => t.priority === 'low').length;
  const medium = tasks.filter((t) => t.priority === 'medium').length;
  const high = tasks.filter((t) => t.priority === 'high').length;

  // Member productivity metrics (completed vs total assigned)
  const memberProductivity = members.map((m) => {
    const assignedTasks = tasks.filter((t) => t.assignedTo?._id === m.user._id);
    const completed = assignedTasks.filter((t) => t.status === 'done').length;
    const totalAssigned = assignedTasks.length;
    const rate = totalAssigned > 0 ? Math.round((completed / totalAssigned) * 100) : 0;
    return {
      user: m.user,
      completed,
      total: totalAssigned,
      rate,
    };
  }).sort((a, b) => b.completed - a.completed);

  // Global Activity Timeline (flattened and sorted by date)
  const activityTimeline = tasks
    .reduce((acc, t) => {
      const logs = t.activityLogs.map((log) => ({
        ...log,
        taskId: t._id,
        taskTitle: t.title,
      }));
      return [...acc, ...logs];
    }, [])
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 10); // Limit to latest 10 activities

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 animate-fade-in">
      {/* Metrics & Productivity Column */}
      <div className="lg:col-span-2 space-y-6">
        {/* Core Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="glass-card rounded-xl p-4 flex flex-col justify-between">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Tasks</span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-2xl font-bold">{total}</span>
              <ClipboardList className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div className="glass-card rounded-xl p-4 flex flex-col justify-between">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">In Progress</span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-2xl font-bold">{inProgress}</span>
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div className="glass-card rounded-xl p-4 flex flex-col justify-between">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Completed</span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-2xl font-bold text-emerald-400">{done}</span>
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div className="glass-card rounded-xl p-4 flex flex-col justify-between">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Completion Rate</span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-2xl font-bold text-purple-400">{doneRate}%</span>
              <BarChart3 className="w-5 h-5 text-purple-400" />
            </div>
          </div>
        </div>

        {/* Priority & Productivity breakdown details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Priorities card */}
          <div className="glass-card rounded-xl p-6">
            <h4 className="font-bold text-sm text-slate-200 mb-4 flex items-center gap-1.5">
              <ListTodo className="w-4 h-4 text-indigo-400" />
              <span>Priority Breakdown</span>
            </h4>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-rose-400 font-medium">High</span>
                  <span>{high} tasks</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-rose-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${total > 0 ? (high / total) * 100 : 0}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-amber-400 font-medium">Medium</span>
                  <span>{medium} tasks</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${total > 0 ? (medium / total) * 100 : 0}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-emerald-400 font-medium">Low</span>
                  <span>{low} tasks</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${total > 0 ? (low / total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Member Productivity card */}
          <div className="glass-card rounded-xl p-6">
            <h4 className="font-bold text-sm text-slate-200 mb-4 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-indigo-400" />
              <span>Member Productivity</span>
            </h4>
            <div className="space-y-4 max-h-[160px] overflow-y-auto pr-1">
              {memberProductivity.map(({ user, completed, total: mTotal, rate }) => (
                <div key={user._id} className="flex items-center gap-3 justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`}
                      alt={user.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="text-xs font-semibold text-slate-300 line-clamp-1">{user.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-right">
                    <span className="text-xs text-slate-400">
                      {completed}/{mTotal} Done
                    </span>
                    <span className={`text-xs font-bold ${rate >= 70 ? 'text-emerald-400' : 'text-slate-400'}`}>
                      {rate}%
                    </span>
                  </div>
                </div>
              ))}
              {memberProductivity.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-6">No member stats available.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Unified Board Activity Timeline */}
      <div className="glass-card rounded-xl p-6 flex flex-col justify-between h-[360px] lg:h-auto">
        <div>
          <h4 className="font-bold text-sm text-slate-200 mb-4 flex items-center gap-1.5">
            <ClipboardList className="w-4 h-4 text-indigo-400" />
            <span>Latest Activities</span>
          </h4>
          <div className="space-y-4 overflow-y-auto pr-1 max-h-[260px] lg:max-h-[300px]">
            {activityTimeline.map((log) => (
              <div key={log._id} className="flex gap-2.5 items-start text-xs border-b border-white/5 pb-2.5 last:border-0 last:pb-0">
                <img
                  src={log.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(log.user?.name || 'User')}`}
                  alt={log.user?.name}
                  className="w-5 h-5 rounded-full object-cover mt-0.5"
                />
                <div className="flex-1">
                  <p className="text-slate-300">
                    <span className="font-semibold text-slate-200">{log.user?.name || 'Someone'}</span>{' '}
                    {log.text}
                  </p>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Task: {log.taskTitle}
                  </span>
                </div>
              </div>
            ))}
            {activityTimeline.length === 0 && (
              <p className="text-xs text-slate-500 text-center py-16">No activities recorded yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
