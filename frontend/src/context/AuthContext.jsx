import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [voterList, setVoterList] = useState(JSON.parse(localStorage.getItem('voters_db')) || []);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser) setUser(storedUser);
    }
  }, [token]);

  const login = async (voterId, password) => {
    try {
      // 1. First try Backend Login
      const response = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voterId, password })
      });

      const data = await response.json();
      
      if (response.ok) {
        const userData = { ...data, id: data._id };
        setUser(userData);
        setToken(data.token);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(userData));
        return userData;
      }

      // 2. If Backend fails, check Local Excel List
      const localUser = voterList.find(v => v.voterId === voterId && v.password === password);
      
      if (localUser) {
        // Ensure local user has 'voter' role for routing
        const userData = { ...localUser, id: localUser.voterId, role: localUser.role || 'voter' };
        setUser(userData);
        setToken('local-token-123'); // Fake token for local dev
        localStorage.setItem('token', 'local-token-123');
        localStorage.setItem('user', JSON.stringify(userData));
        return userData;
      }

      throw new Error(data.message || 'Invalid Credentials');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const importVoters = (newList) => {
    setVoterList(newList);
    localStorage.setItem('voters_db', JSON.stringify(newList));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const recordVote = async (campaignId, candidateId) => {
    try {
      const resp = await fetch('http://localhost:5001/api/vote/cast', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ campaignId, candidateId })
      });

      const data = await resp.json();
      if (!resp.ok) throw new Error(data.message || 'Mission Ingress Failed');

      // Update local state for UI feedback
      const updatedUser = { ...user, hasVoted: true };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return data; // Return the receipt info
    } catch (err) {
      console.error('Vote storage error:', err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, recordVote, importVoters, voterList }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
