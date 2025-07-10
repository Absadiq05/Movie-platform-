// client/src/pages/Profile.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import './Profile.css'; // Styling for profile page

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000/api';
const TMDB_POSTER_SMALL = 'https://image.tmdb.org/t/p/w200';

function Profile() {
    const { user, logout, setUser } = useAuth(); // Assuming setUser is exposed by AuthContext
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [newWatchlistName, setNewWatchlistName] = useState('');

    const fetchProfile = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No token found');
            }
            const res = await axios.get(`${API_URL}/users/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfileData(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching profile:', err);
            setError('Failed to load profile data.');
            setLoading(false);
            logout(); // Log out if token is invalid or expired
        }
    }, [logout]);

    useEffect(() => {
        if (user) {
            fetchProfile();
        }
    }, [user, fetchProfile]);

    const handleRemoveFavorite = async (tmdbId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/movies/favorites/${tmdbId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Movie removed from favorites!');
            fetchProfile(); // Refresh profile data
        } catch (error) {
            console.error('Error removing favorite:', error.response?.data?.message || error.message);
            alert('Failed to remove from favorites.');
        }
    };

    const handleCreateWatchlist = async (e) => {
        e.preventDefault();
        if (!newWatchlistName.trim()) {
            return alert('Watchlist name cannot be empty.');
        }
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/movies/watchlists`, { name: newWatchlistName }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNewWatchlistName('');
            alert('Watchlist created!');
            fetchProfile(); // Refresh profile data
        } catch (error) {
            console.error('Error creating watchlist:', error.response?.data?.message || error.message);
            alert(error.response?.data?.message || 'Failed to create watchlist.');
        }
    };

    const handleAddMovieToWatchlist = async (watchlistId, movie) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/movies/watchlists/${watchlistId}/add`,
                { tmdbId: movie.id, title: movie.title, posterPath: movie.poster_path },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert(`"${movie.title}" added to watchlist!`);
            fetchProfile(); // Refresh profile data
        } catch (error) {
            console.error('Error adding movie to watchlist:', error.response?.data?.message || error.message);
            alert(error.response?.data?.message || 'Failed to add movie to watchlist.');
        }
    };

    const handleRemoveMovieFromWatchlist = async (watchlistId, tmdbId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/movies/watchlists/${watchlistId}/remove/${tmdbId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Movie removed from watchlist!');
            fetchProfile(); // Refresh profile data
        } catch (error) {
            console.error('Error removing movie from watchlist:', error.response?.data?.message || error.message);
            alert('Failed to remove movie from watchlist.');
        }
    };

    if (loading) return <div className="profile-container">Loading profile...</div>;
    if (error) return <div className="profile-container error-message">{error}</div>;
    if (!user || !profileData) return <div className="profile-container">Please login to view your profile.</div>;

    return (
        <div className="profile-container">
            <h1>Welcome, {profileData.username}!</h1>
            <p>Email: {profileData.email}</p>

            <section className="favorites-section">
                <h2>Favorite Movies</h2>
                {profileData.favoriteMovies && profileData.favoriteMovies.length > 0 ? (
                    <div className="movie-grid">
                        {profileData.favoriteMovies.map(movie => (
                            <div key={movie.tmdbId} className="movie-card">
                                <Link to={`/movie/${movie.tmdbId}`}>
                                    <img
                                        src={movie.posterPath ? `${TMDB_POSTER_SMALL}${movie.posterPath}` : 'https://via.placeholder.com/150x225?text=No+Image'}
                                        alt={movie.title}
                                    />
                                    <h3>{movie.title}</h3>
                                </Link>
                                <button onClick={() => handleRemoveFavorite(movie.tmdbId)} className="remove-btn">
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>You have no favorite movies yet. Start discovering them!</p>
                )}
            </section>

            <section className="watchlists-section">
                <h2>Your Watchlists</h2>
                <form onSubmit={handleCreateWatchlist} className="create-watchlist-form">
                    <input
                        type="text"
                        placeholder="New watchlist name"
                        value={newWatchlistName}
                        onChange={(e) => setNewWatchlistName(e.target.value)}
                        required
                    />
                    <button type="submit">Create Watchlist</button>
                </form>

                {profileData.watchlists && profileData.watchlists.length > 0 ? (
                    profileData.watchlists.map(watchlist => (
                        <div key={watchlist._id} className="watchlist-card">
                            <h3>{watchlist.name}</h3>
                            {watchlist.movies.length > 0 ? (
                                <div className="movie-grid">
                                    {watchlist.movies.map(movie => (
                                        <div key={movie.tmdbId} className="movie-card">
                                            <Link to={`/movie/${movie.tmdbId}`}>
                                                <img
                                                    src={movie.posterPath ? `${TMDB_POSTER_SMALL}${movie.posterPath}` : 'https://via.placeholder.com/150x225?text=No+Image'}
                                                    alt={movie.title}
                                                />
                                                <h3>{movie.title}</h3>
                                            </Link>
                                            <button onClick={() => handleRemoveMovieFromWatchlist(watchlist._id, movie.tmdbId)} className="remove-btn">
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p>This watchlist is empty. Add some movies!</p>
                            )}
                            {/* You could add a button here to easily add movies to this watchlist from search results */}
                        </div>
                    ))
                ) : (
                    <p>You have no watchlists yet. Create one!</p>
                )}
            </section>

            {/* User Profile Management (Stretch Goal - update username/email) */}
            {/* You'd add a form here similar to register/login for updating profile */}
        </div>
    );
}

export default Profile;
      
