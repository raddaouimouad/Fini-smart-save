import React, { createContext, useContext, useReducer, useEffect } from 'react';
import api from '../lib/api';

const AuthContext = createContext(null);

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: action.payload.user, token: action.payload.token, loading: false };
    case 'LOGOUT':
      return { ...state, user: null, token: null, loading: false };
    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.payload } };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
};

const initialState = {
  user: null,
  token: null,
  loading: true,
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const token = localStorage.getItem('fini_token');
    const user = localStorage.getItem('fini_user');
    if (token && user) {
      dispatch({ type: 'LOGIN', payload: { token, user: JSON.parse(user) } });
      // Verify token with backend
      api.get('/auth/me')
        .then(res => {
          dispatch({ type: 'UPDATE_USER', payload: res.data.user });
        })
        .catch(() => {
          localStorage.removeItem('fini_token');
          localStorage.removeItem('fini_user');
          dispatch({ type: 'LOGOUT' });
        });
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token, user } = res.data;
    localStorage.setItem('fini_token', token);
    localStorage.setItem('fini_user', JSON.stringify(user));
    dispatch({ type: 'LOGIN', payload: { token, user } });
    return res.data;
  };

  const register = async (data) => {
    const res = await api.post('/auth/register', data);
    const { token, user } = res.data;
    localStorage.setItem('fini_token', token);
    localStorage.setItem('fini_user', JSON.stringify(user));
    dispatch({ type: 'LOGIN', payload: { token, user } });
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('fini_token');
    localStorage.removeItem('fini_user');
    dispatch({ type: 'LOGOUT' });
  };

  const updateUser = (data) => {
    const updated = { ...state.user, ...data };
    localStorage.setItem('fini_user', JSON.stringify(updated));
    dispatch({ type: 'UPDATE_USER', payload: data });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
