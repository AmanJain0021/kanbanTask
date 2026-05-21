import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  DndContext,
  useSensors,
  useSensor,
  PointerSensor,
  KeyboardSensor,
  closestCorners,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useGetBoardByIdQuery } from '../../store/services/boardApi';
import {
  taskApi,
  useGetBoardTasksQuery,
  useUpdateTaskMutation,
} from '../../store/services/taskApi';
import { useSocket } from '../../hooks/useSocket';
import { calculateNewPosition } from '../../utils/fractionalIndex';
import Navbar from '../common/Navbar';
import BoardHeader from './BoardHeader';
import BoardFilters from './BoardFilters';
import AnalyticsDashboard from './AnalyticsDashboard';
import Column from './Column';
import TaskModal from './TaskModal';
import toast from 'react-hot-toast';
import { Loader2, KanbanSquare } from 'lucide-react';

const BoardDetails = () => {
  const { id: boardId } = useParams();
  const dispatch = useDispatch();
  const socket = useSocket();

  const [showAnalytics, setShowAnalytics] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Queries
  const { data: boardData, isLoading: isBoardLoading, error: boardError } = useGetBoardByIdQuery(boardId);
  const { data: tasksData, isLoading: isTasksLoading } = useGetBoardTasksQuery(boardId);
  const [updateTask] = useUpdateTaskMutation();

  const board = boardData?.data;
  const tasks = tasksData?.data || [];

  // Redux filters
  const filters = useSelector((state) => state.board.filters);

  // Join/Leave socket room
  useEffect(() => {
    if (socket && boardId) {
      socket.emit('board:join', { boardId });
      socket.emit('board:sync', { boardId });
      return () => {
        socket.emit('board:leave');
      };
    }
  }, [socket, boardId]);

  // Configure drag sensors with activation constraints
  // So click events on edit/delete buttons don't get swallowed as drag triggers
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Filter tasks based on Redux filter state
  const filteredTasks = tasks.filter((task) => {
    // 1. Text Search
    if (filters.search) {
      const query = filters.search.toLowerCase();
      const matchTitle = task.title?.toLowerCase().includes(query);
      const matchDesc = task.description?.toLowerCase().includes(query);
      if (!matchTitle && !matchDesc) return false;
    }

    // 2. Priority
    if (filters.priority !== 'all') {
      if (task.priority !== filters.priority) return false;
    }

    // 3. Assignee
    if (filters.assignedTo !== 'all') {
      if (task.assignedTo?._id !== filters.assignedTo) return false;
    }

    // 4. Due Date
    if (filters.dueDate !== 'all') {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      const today = new Date();

      if (filters.dueDate === 'today') {
        if (taskDate.toDateString() !== today.toDateString()) return false;
      } else if (filters.dueDate === 'this-week') {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const endOfWeek = new Date();
        endOfWeek.setDate(startOfToday.getDate() + 7);
        endOfWeek.setHours(23, 59, 59, 999);
        if (taskDate < startOfToday || taskDate > endOfWeek) return false;
      } else if (filters.dueDate === 'overdue') {
        if (taskDate >= today || task.status === 'done') return false;
      }
    }

    return true;
  });

  // Group tasks by column status
  const columns = {
    todo: { title: 'To Do', status: 'todo', tasks: [] },
    'in-progress': { title: 'In Progress', status: 'in-progress', tasks: [] },
    review: { title: 'Review', status: 'review', tasks: [] },
    done: { title: 'Done', status: 'done', tasks: [] },
  };

  filteredTasks.forEach((task) => {
    if (columns[task.status]) {
      columns[task.status].tasks.push(task);
    }
  });

  // Sort each column's tasks by position ascending
  Object.keys(columns).forEach((status) => {
    columns[status].tasks.sort((a, b) => a.position - b.position);
  });

  // Find selected task in live tasks list so that modal gets live updates
  const activeTask = selectedTask
    ? tasks.find((t) => t._id === selectedTask._id) || selectedTask
    : null;

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Find the task being dragged
    const activeTask = tasks.find((t) => t._id === activeId);
    if (!activeTask) return;

    let targetStatus = activeTask.status;
    let targetIndex = -1;

    const isColumnStatus = ['todo', 'in-progress', 'review', 'done'].includes(overId);

    if (isColumnStatus) {
      targetStatus = overId;
      const columnTasks = tasks
        .filter((t) => t.status === targetStatus)
        .sort((a, b) => a.position - b.position);
      targetIndex = columnTasks.length;
    } else {
      // Over another task
      const overTask = tasks.find((t) => t._id === overId);
      if (!overTask) return;

      targetStatus = overTask.status;
      const columnTasks = tasks
        .filter((t) => t.status === targetStatus && t._id !== activeId)
        .sort((a, b) => a.position - b.position);

      targetIndex = columnTasks.findIndex((t) => t._id === overId);
    }

    const columnTasks = tasks
      .filter((t) => t.status === targetStatus && t._id !== activeId)
      .sort((a, b) => a.position - b.position);

    const newPosition = calculateNewPosition(columnTasks, targetIndex);

    // If status and position haven't changed, ignore
    if (activeTask.status === targetStatus && activeTask.position === newPosition) {
      return;
    }

    // Save snapshot of current tasks for rollback on error
    const originalTasks = [...tasks];

    // Create updated task payload
    const updatedTask = {
      ...activeTask,
      status: targetStatus,
      position: newPosition,
      version: activeTask.version + 1,
    };

    // Optimistically update the RTK Query cache
    dispatch(
      taskApi.util.updateQueryData('getBoardTasks', boardId, (draft) => {
        if (draft && draft.data) {
          const index = draft.data.findIndex((t) => t._id === activeId);
          if (index !== -1) {
            draft.data[index] = updatedTask;
          }
          draft.data.sort((a, b) => a.position - b.position);
        }
      })
    );

    try {
      await updateTask({
        id: activeId,
        status: targetStatus,
        position: newPosition,
        version: activeTask.version,
      }).unwrap();
    } catch (err) {
      console.error('Task move failed:', err);
      if (err.status === 409) {
        toast.error('Stale update rejected. Re-syncing board...');
      } else {
        toast.error('Failed to move task. Reverting...');
      }

      // Rollback cache state
      dispatch(
        taskApi.util.updateQueryData('getBoardTasks', boardId, (draft) => {
          if (draft && draft.data) {
            draft.data = originalTasks;
          }
        })
      );
    }
  };

  if (isBoardLoading || isTasksLoading) {
    return (
      <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        <span className="text-sm font-semibold">Loading Board workspace...</span>
      </div>
    );
  }

  if (boardError || !board) {
    return (
      <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center text-slate-400 gap-4">
        <KanbanSquare className="w-12 h-12 text-red-500/80" />
        <h3 className="text-lg font-bold text-slate-200">Board not found</h3>
        <p className="text-sm text-slate-500 max-w-sm text-center">
          The board you are looking for does not exist or you do not have permission to view it.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950 text-slate-100 pb-12">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <BoardHeader
          board={board}
          showAnalytics={showAnalytics}
          setShowAnalytics={setShowAnalytics}
        />

        {showAnalytics && (
          <AnalyticsDashboard tasks={tasks} members={board.members} />
        )}

        <BoardFilters members={board.members} />

        {/* Drag Drop Area */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragEnd={handleDragEnd}
        >
          <div className="flex flex-row gap-6 items-start overflow-x-auto pb-4 scrollbar-thin">
            {Object.values(columns).map((col) => (
              <Column
                key={col.status}
                status={col.status}
                title={col.title}
                tasks={col.tasks}
                onTaskClick={setSelectedTask}
                boardId={boardId}
              />
            ))}
          </div>
        </DndContext>
      </main>

      {/* Task Details Modal */}
      {selectedTask && activeTask && (
        <TaskModal
          task={activeTask}
          boardId={boardId}
          members={board.members}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
};

export default BoardDetails;
