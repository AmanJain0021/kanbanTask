import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  filters: {
    priority: 'all',
    assignedTo: 'all',
    dueDate: 'all',
    search: '',
  },
  onlineMembers: [],
  typingUsers: {}, // Maps taskId (or 'general') -> array of typing users [{ userId, userName }]
};

const boardSlice = createSlice({
  name: 'board',
  initialState,
  reducers: {
    setFilter: (state, action) => {
      const { name, value } = action.payload;
      state.filters[name] = value;
    },
    clearFilters: (state) => {
      state.filters = { ...initialState.filters };
    },
    setOnlineMembers: (state, action) => {
      state.onlineMembers = action.payload;
    },
    userTypingStart: (state, action) => {
      const { userId, userName, taskId } = action.payload;
      const key = taskId || 'general';
      if (!state.typingUsers[key]) {
        state.typingUsers[key] = [];
      }
      if (!state.typingUsers[key].some((u) => u.userId === userId)) {
        state.typingUsers[key].push({ userId, userName });
      }
    },
    userTypingStop: (state, action) => {
      const { userId, taskId } = action.payload;
      const key = taskId || 'general';
      if (state.typingUsers[key]) {
        state.typingUsers[key] = state.typingUsers[key].filter(
          (u) => u.userId !== userId
        );
      }
    },
  },
});

export const {
  setFilter,
  clearFilters,
  setOnlineMembers,
  userTypingStart,
  userTypingStop,
} = boardSlice.actions;

export default boardSlice.reducer;
