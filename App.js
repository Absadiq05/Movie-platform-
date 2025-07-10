// client/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import MovieDetails from './pages/MovieDetails';
import Profile from './pages/Profile';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css'; // Your main app styles

// PrivateRoute component to protect routes
const PrivateRoute = ({ children }) => {
    const { user } = useAuth();
    return user ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <Header />
                <main>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/movie/:id" element={<MovieDetails />} />
                        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                        {/* Add more routes here, e.g., for watchlists */}
                    </Routes>
                </main>
            </AuthProvider>
        </Router>
    );
}

export default App;
      
