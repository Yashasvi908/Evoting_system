import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './Login';
import Dashboard from './pages/Dashboard';
import PreVoting from './pages/PreVoting';
import VotingPage from './pages/VotingPage';
import ReceiptScreen from './pages/ReceiptScreen';
import PostVoteHistory from './pages/PostVoteHistory';
import AdminDashboard from './pages/AdminDashboard';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/voter'} replace />;
  }
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route path="/" element={<Layout />}>
        <Route index element={<ProtectedRoute><Navigate to="/voter" replace /></ProtectedRoute>} />
        <Route path="voter" element={<ProtectedRoute allowedRole="voter"><Dashboard /></ProtectedRoute>} />
        <Route path="prevoting" element={<ProtectedRoute allowedRole="voter"><PreVoting /></ProtectedRoute>} />
        <Route path="vote" element={<ProtectedRoute allowedRole="voter"><VotingPage /></ProtectedRoute>} />
        <Route path="receipt" element={<ProtectedRoute allowedRole="voter"><ReceiptScreen /></ProtectedRoute>} />
        <Route path="history" element={<ProtectedRoute allowedRole="voter"><PostVoteHistory /></ProtectedRoute>} />
        <Route path="admin" element={<ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
