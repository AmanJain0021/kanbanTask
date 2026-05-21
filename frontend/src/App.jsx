import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Boards from './components/board/Boards';
import BoardDetails from './components/board/BoardDetails';
import ProtectedRoute from './components/common/ProtectedRoute';

function App() {
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(15, 23, 42, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            color: '#f8fafc',
            backdropFilter: 'blur(8px)',
          },
          duration: 3000,
        }}
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected MERN Board Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/boards" element={<Boards />} />
          <Route path="/board/:id" element={<BoardDetails />} />
        </Route>

        {/* Fallback routes */}
        <Route path="*" element={<Navigate to="/boards" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
