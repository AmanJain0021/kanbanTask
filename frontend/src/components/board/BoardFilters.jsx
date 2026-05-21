import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setFilter, clearFilters } from '../../store/slices/boardSlice';
import { Search, RotateCcw, Filter } from 'lucide-react';

const BoardFilters = ({ members }) => {
  const dispatch = useDispatch();
  const filters = useSelector((state) => state.board.filters);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    dispatch(setFilter({ name, value }));
  };

  const handleSearchChange = (e) => {
    dispatch(setFilter({ name: 'search', value: e.target.value }));
  };

  const handleReset = () => {
    dispatch(clearFilters());
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-4 rounded-xl mb-6">
      <div className="flex items-center gap-2 text-slate-300 font-semibold text-sm">
        <Filter className="w-4 h-4 text-indigo-400" />
        <span>Filters:</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:flex flex-wrap items-center gap-3 flex-1 max-w-4xl">
        {/* Text Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={filters.search}
            onChange={handleSearchChange}
            className="w-full pl-9 pr-4 py-1.5 rounded-lg glass-input text-xs"
          />
        </div>

        {/* Priority Filter */}
        <select
          name="priority"
          value={filters.priority}
          onChange={handleFilterChange}
          className="px-3 py-1.5 rounded-lg glass-input text-xs"
        >
          <option value="all">All Priorities</option>
          <option value="low">Low Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="high">High Priority</option>
        </select>

        {/* Assignee Filter */}
        <select
          name="assignedTo"
          value={filters.assignedTo}
          onChange={handleFilterChange}
          className="px-3 py-1.5 rounded-lg glass-input text-xs"
        >
          <option value="all">All Assignees</option>
          {members.map((member) => (
            <option key={member.user._id} value={member.user._id}>
              {member.user.name}
            </option>
          ))}
        </select>

        {/* Due Date Filter */}
        <select
          name="dueDate"
          value={filters.dueDate}
          onChange={handleFilterChange}
          className="px-3 py-1.5 rounded-lg glass-input text-xs"
        >
          <option value="all">All Due Dates</option>
          <option value="today">Due Today</option>
          <option value="this-week">Due This Week</option>
          <option value="overdue">Overdue</option>
        </select>

        {/* Reset Button */}
        {(filters.search || filters.priority !== 'all' || filters.assignedTo !== 'all' || filters.dueDate !== 'all') && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-xs transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default BoardFilters;
