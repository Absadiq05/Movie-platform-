// client/src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // Note: Use named import for jwt-decode

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000/api'; // Ensure this matches your backend URL

    useEffect(() => {
        // Check for token in localStorage on component mount
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                // Check if token is expired
                if (decoded.exp * 1000 < Date.now()) {
                    localStorage.removeItem('token');
                    setUser(null);
                } else {
                    // Set user from decoded token (we only store id, username, email)
                    setUser({ _id: decoded.id, username: decoded.username, email: decoded.email });
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                }
            } catch (error) {
                console.error('Invalid token:', error);
                localStorage.removeItem('token');
                setUser(null);
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const res = await axios.post(`${API_URL}/users/login`, { email, password });
            localStorage.setItem('token', res.data.token);
            const decoded = jwtDecode(res.data.token);
            setUser({ _id: decoded.id, username: res.data.username, email: res.data.email }); // Update user state with full data from login response
            axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
            return res.data;
        } catch (error) {
            console.error('Login failed:', error.response?.data?.message || error.message);
            throw error.response?.data?.message || 'Login failed';
        }
    };

    const register = async (username, email, password) => {
        try {
            const res = await axios.post(`${API_URL}/users/register`, { username, email, password });
            localStorage.setItem('token', res.data.token);
            const decoded = jwtDecode(res.data.token);
            setUser({ _id: decoded.id, username: res.data.username, email: res.data.email }); // Update user state
            axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
            return res.data;
        } catch (error) {
            console.error('Registration failed:', error.response?.data?.message || error.message);
            throw error.response?.data?.message || 'Registration failed';
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
              
