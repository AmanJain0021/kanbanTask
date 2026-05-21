import { configureStore } from '@reduxjs/toolkit';
import { api } from './services/api';
import authReducer from './slices/authSlice';
import boardReducer from './slices/boardSlice';

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    auth: authReducer,
    board: boardReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Disable checks for rich event payloads in drag-drop
    }).concat(api.middleware),
});
