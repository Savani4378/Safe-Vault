/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import { useAutoLock } from './hooks/useAutoLock';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Logs from './pages/Logs';
import Layout from './components/Layout';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = useStore(state => state.token);
  useAutoLock(); // Start auto lock when private route renders
  return token ? <>{children}</> : <Navigate to="/login" />;
}

// Disguise UI component that looks like a standard server error
function DisguiseUI() {
  return (
    <div className="min-h-screen bg-white text-black flex flex-col items-center justify-center font-sans" style={{ fontFamily: 'sans-serif' }}>
      <h1 className="text-4xl font-bold mb-4">502 Bad Gateway</h1>
      <hr className="w-1/4 border-gray-400 mb-4" />
      <span className="text-sm">nginx/1.18.0 (Ubuntu)</span>
    </div>
  );
}

export default function App() {
  const { isDisguised, toggleDisguise } = useStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Listen for Ctrl+Shift+H
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        toggleDisguise();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleDisguise]);

  if (isDisguised) {
    return <DisguiseUI />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="settings" element={<Settings />} />
          <Route path="logs" element={<Logs />} />
        </Route>
      </Routes>
    </Router>
  );
}
