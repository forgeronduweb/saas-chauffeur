import { createContext, useContext, useState, useEffect } from 'react';
import { config } from '../config/env';
import { api } from '../services/api';
import logger from '../utils/logger';
import errorHandler from '../utils/errorHandler';

// Configuration API
const API_BASE_URL = config.api.baseUrl;

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Vérifier le token au chargement
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (error) {
        logger.error('Erreur lors de la récupération des données utilisateur stockées', { error });
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      logger.info('Login attempt started', { email });
      
      const response = await api.post('/auth/login', { email, password });
      const data = response.data;

      // Stocker le token et les infos utilisateur
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      setToken(data.token);
      setUser(data.user);

      logger.info('Login successful', { userId: data.user.id, role: data.user.role });
      return { success: true, user: data.user };
      
    } catch (error) {
      // Si l'email n'est pas vérifié (403), retourner les infos supplémentaires
      if (error.response?.status === 403 && error.response?.data?.requiresEmailVerification) {
        return { 
          success: false, 
          error: error.response.data.error,
          requiresEmailVerification: true,
          email: error.response.data.email
        };
      }
      
      logger.error('Login failed', { email, error: error.message });
      return { 
        success: false, 
        error: error.response?.data?.error || error.message || 'Erreur de connexion'
      };
    }
  };

  const register = async (userData) => {
    try {
      console.log('Register attempt with API_BASE_URL:', API_BASE_URL);
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'inscription');
      }

      // Stocker le token et les infos utilisateur
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      setToken(data.token);
      setUser(data.user);

      return { success: true, user: data.user };
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const refreshUser = async () => {
    try {
      if (!token) return;
      
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération du profil');
      }

      const data = await response.json();
      const updatedUser = data.user;
      
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return updatedUser;
    } catch (error) {
      console.error('Erreur lors du rafraîchissement du profil:', error);
      return null;
    }
  };

  const isAuthenticated = () => {
    return !!token && !!user;
  };

  const isDriver = () => {
    return user?.role === 'driver';
  };

  const isClient = () => {
    return user?.role === 'client';
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const getAuthHeaders = () => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
    isAuthenticated,
    isDriver,
    isClient,
    isAdmin,
    getAuthHeaders,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
