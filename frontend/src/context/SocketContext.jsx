import React, { createContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { taskApi } from '../store/services/taskApi';
import {
  setOnlineMembers,
  userTypingStart,
  userTypingStop,
} from '../store/slices/boardSlice';

export const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    // Connect to Socket.io via our proxy path
    const socketInstance = io('/', {
      auth: { token },
      transports: ['websocket'],
      autoConnect: true,
    });

    socketInstance.on('connect', () => {
      console.log('Connected to socket server');
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });

    // Handle online member list changes
    socketInstance.on('member:online', (data) => {
      dispatch(setOnlineMembers(data.onlineMembers));
    });

    socketInstance.on('member:offline', (data) => {
      dispatch(setOnlineMembers(data.onlineMembers));
    });

    socketInstance.on('board:sync', (data) => {
      dispatch(setOnlineMembers(data.onlineMembers));
    });

    // Handle typing indicators
    socketInstance.on('typing:start', (data) => {
      dispatch(userTypingStart(data));
    });

    socketInstance.on('typing:stop', (data) => {
      dispatch(userTypingStop(data));
    });

    // Synchronize tasks on real-time triggers using RTK Query Cache Utilities
    socketInstance.on('task:create', (populatedTask) => {
      dispatch(
        taskApi.util.updateQueryData('getBoardTasks', populatedTask.boardId, (draft) => {
          if (draft && draft.data) {
            const exists = draft.data.some((t) => t._id === populatedTask._id);
            if (!exists) {
              draft.data.push(populatedTask);
              draft.data.sort((a, b) => a.position - b.position);
            }
          }
        })
      );
    });

    socketInstance.on('task:update', (populatedTask) => {
      dispatch(
        taskApi.util.updateQueryData('getBoardTasks', populatedTask.boardId, (draft) => {
          if (draft && draft.data) {
            const index = draft.data.findIndex((t) => t._id === populatedTask._id);
            if (index !== -1) {
              draft.data[index] = populatedTask;
            } else {
              draft.data.push(populatedTask);
            }
            draft.data.sort((a, b) => a.position - b.position);
          }
        })
      );
    });

    socketInstance.on('task:move', (populatedTask) => {
      dispatch(
        taskApi.util.updateQueryData('getBoardTasks', populatedTask.boardId, (draft) => {
          if (draft && draft.data) {
            const index = draft.data.findIndex((t) => t._id === populatedTask._id);
            if (index !== -1) {
              draft.data[index] = populatedTask;
            } else {
              draft.data.push(populatedTask);
            }
            draft.data.sort((a, b) => a.position - b.position);
          }
        })
      );
    });

    socketInstance.on('task:delete', (data) => {
      dispatch(
        taskApi.util.updateQueryData('getBoardTasks', data.boardId, (draft) => {
          if (draft && draft.data) {
            draft.data = draft.data.filter((t) => t._id !== data.taskId);
          }
        })
      );
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [token, dispatch]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
