// client/src/pages/Home.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css'; // Basic styling for home page

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000/api';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500'; // For movie posters

function Home() {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchMovies = useCallback(async (searchQuery = '', pageNum = 1) => {
        setLoading(true);
        setError('');
        try {
            const url = `${API_URL}/movies/search?query=${encodeURIComponent(searchQuery)}&page=${pageNum}`;
            const res = await axios.get(url);
            setMovies(res.data.results);
            setTotalPages(res.data.total_pages);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching movies:', err);
            setError('Failed to fetch movies. Please try again.');
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMovies('', 1); // Fetch popular movies on initial load
    }, [fetchMovies]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1); // Reset page to 1 for new search
        fetchMovies(searchTerm, 1);
    };

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= totalPages) {
            setPage(newPage);
            fetchMovies(searchTerm, newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top on page change
        }
    };

    const handleAddFavorite = async (movie) => {
        if (!user) {
            alert('Please login to add favorites!');
            return;
        }
        try {
            await axios.post(
                `${API_URL}/movies/favorites`,
                {
                    tmdbId: movie.id,
                    title: movie.title,
                    posterPath: movie.poster_path,
                    releaseDate: movie.release_date
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            alert(`${movie.title} added to favorites!`);
            // Optionally, refresh user profile data or update local state
        } catch (error) {
            console.error('Error adding to favorites:', error.response?.data?.message || error.message);
            alert(error.response?.data?.message || 'Failed to add to favorites.');
        }
    };

    return (
        <div className="home-container">
            <h1>Discover Movies</h1>
            <form onSubmit={handleSearch} className="search-form">
                <input
                    type="text"
                    placeholder="Search for movies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button type="submit">Search</button>
            </form>

            {loading && <p>Loading movies...</p>}
            {error && <p className="error-message">{error}</p>}

            <div className="movie-grid">
                {movies.length > 0 ? (
                    movies.map(movie => (
                        <div key={movie.id} className="movie-card">
                            <Link to={`/movie/${movie.id}`}>
                                <img
                                    src={movie.poster_path ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : 'https://via.placeholder.com/150x225?text=No+Image'}
                                    alt={movie.title}
                                />
                                <h3>{movie.title}</h3>
                                <p>{movie.release_date ? movie.release_date.substring(0, 4) : 'N/A'}</p>
                            </Link>
                            {user && (
                                <button onClick={() => handleAddFavorite(movie)} className="add-favorite-btn">
                                    Add to Favorites
                                </button>
                            )}
                        </div>
                    ))
                ) : (
                    !loading && <p>No movies found. Try a different search!</p>
                )}
            </div>

            {movies.length > 0 && (
                <div className="pagination">
                    <button onClick={() => handlePageChange(page - 1)} disabled={page === 1}>Previous</button>
                    <span>Page {page} of {totalPages}</span>
                    <button onClick={() => handlePageChange(page + 1)} disabled={page === totalPages}>Next</button>
                </div>
            )}
        </div>
    );
}

export default Home;
                      
