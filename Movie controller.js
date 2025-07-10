// server/controllers/movieController.js
const axios = require('axios');
const User = require('../models/User'); // Import User model to interact with favoriteMovies/watchlists

const TMDB_API_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = process.env.TMDB_API_KEY;

// @desc    Search movies by title, genre, or year
// @route   GET /api/movies/search
// @access  Public
const searchMovies = async (req, res) => {
    const { query, genre, year, page = 1 } = req.query; // Added page for pagination
    let url = `${TMDB_API_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&page=${page}`;

    if (query) {
        url += `&query=${encodeURIComponent(query)}`;
    } else {
        // If no specific query, perhaps search popular movies
        url = `${TMDB_API_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=${page}`;
    }

    // TMDb's search API doesn't directly support genre/year in the same way.
    // For specific genre/year filtering, you'd typically use the /discover/movie endpoint.
    // This example focuses on 'search' but notes the discovery endpoint.
    // For more advanced filtering, consider the /discover endpoint logic.

    try {
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        console.error('Error searching movies:', error.message);
        res.status(500).json({ message: 'Error searching movies from external API' });
    }
};

// @desc    Get detailed movie information
// @route   GET /api/movies/:id
// @access  Public
const getMovieDetails = async (req, res) => {
    const { id } = req.params;
    const url = `${TMDB_API_BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos,reviews`; // append_to_response for more details

    try {
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        console.error('Error getting movie details:', error.message);
        res.status(error.response ? error.response.status : 500).json({ message: 'Error getting movie details from external API' });
    }
};

// @desc    Get personalized recommendations (based on user's liked movies or a specific movie)
// @route   GET /api/movies/recommendations/:movieId?
// @access  Private (or Public for general popular/trending)
const getRecommendations = async (req, res) => {
    const { movieId } = req.params;
    let url;

    // For simplicity, if a specific movieId is provided, use TMDb's "recommendations" API.
    // Otherwise, for truly personalized recommendations based on user's past data,
    // you'd need a more complex algorithm (stretch goal).
    if (movieId) {
        url = `${TMDB_API_BASE_URL}/movie/${movieId}/recommendations?api_key=${TMDB_API_KEY}`;
    } else {
        // Fallback: general trending movies if no specific movie ID is given
        url = `${TMDB_API_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}`;
    }

    try {
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        console.error('Error getting recommendations:', error.message);
        res.status(500).json({ message: 'Error getting recommendations from external API' });
    }
};

// @desc    Add a movie to user's favorites
// @route   POST /api/movies/favorites
// @access  Private
const addFavoriteMovie = async (req, res) => {
    const { tmdbId, title, posterPath, releaseDate } = req.body; // Ensure tmdbId is unique for favoriteMovies array
    if (!tmdbId || !title) {
        return res.status(400).json({ message: 'Movie ID and title are required.' });
    }

    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if movie already in favorites
        const isFavorite = user.favoriteMovies.some(movie => movie.tmdbId === tmdbId);
        if (isFavorite) {
            return res.status(409).json({ message: 'Movie already in favorites' });
        }

        user.favoriteMovies.push({ tmdbId, title, posterPath, releaseDate });
        await user.save();
        res.status(200).json({ message: 'Movie added to favorites', favoriteMovies: user.favoriteMovies });
    } catch (error) {
        console.error('Error adding favorite movie:', error);
        res.status(500).json({ message: 'Server error adding favorite movie' });
    }
};

// @desc    Remove a movie from user's favorites
// @route   DELETE /api/movies/favorites/:tmdbId
// @access  Private
const removeFavoriteMovie = async (req, res) => {
    const { tmdbId } = req.params;

    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const initialLength = user.favoriteMovies.length;
        user.favoriteMovies = user.favoriteMovies.filter(movie => movie.tmdbId !== parseInt(tmdbId));

        if (user.favoriteMovies.length === initialLength) {
            return res.status(404).json({ message: 'Movie not found in favorites' });
        }

        await user.save();
        res.status(200).json({ message: 'Movie removed from favorites', favoriteMovies: user.favoriteMovies });
    } catch (error) {
        console.error('Error removing favorite movie:', error);
        res.status(500).json({ message: 'Server error removing favorite movie' });
    }
};

// @desc    Create a new watchlist
// @route   POST /api/movies/watchlists
// @access  Private
const createWatchlist = async (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ message: 'Watchlist name is required.' });
    }

    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if watchlist with same name already exists
        const watchlistExists = user.watchlists.some(wl => wl.name.toLowerCase() === name.toLowerCase());
        if (watchlistExists) {
            return res.status(409).json({ message: 'Watchlist with this name already exists.' });
        }

        user.watchlists.push({ name, movies: [] });
        await user.save();
        res.status(201).json({ message: 'Watchlist created successfully', watchlists: user.watchlists });
    } catch (error) {
        console.error('Error creating watchlist:', error);
        res.status(500).json({ message: 'Server error creating watchlist' });
    }
};

// @desc    Add movie to a specific watchlist
// @route   POST /api/movies/watchlists/:watchlistId/add
// @access  Private
const addMovieToWatchlist = async (req, res) => {
    const { watchlistId } = req.params;
    const { tmdbId, title, posterPath } = req.body;

    if (!tmdbId || !title) {
        return res.status(400).json({ message: 'Movie ID and title are required.' });
    }

    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const watchlist = user.watchlists.id(watchlistId);
        if (!watchlist) {
            return res.status(404).json({ message: 'Watchlist not found' });
        }

        // Check if movie already in this watchlist
        const movieExistsInWatchlist = watchlist.movies.some(movie => movie.tmdbId === tmdbId);
        if (movieExistsInWatchlist) {
            return res.status(409).json({ message: 'Movie already in this watchlist' });
        }

        watchlist.movies.push({ tmdbId, title, posterPath });
        await user.save();
        res.status(200).json({ message: 'Movie added to watchlist', watchlist });
    } catch (error) {
        console.error('Error adding movie to watchlist:', error);
        res.status(500).json({ message: 'Server error adding movie to watchlist' });
    }
};

// @desc    Remove movie from a specific watchlist
// @route   DELETE /api/movies/watchlists/:watchlistId/remove/:tmdbId
// @access  Private
const removeMovieFromWatchlist = async (req, res) => {
    const { watchlistId, tmdbId } = req.params;

    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const watchlist = user.watchlists.id(watchlistId);
        if (!watchlist) {
            return res.status(404).json({ message: 'Watchlist not found' });
        }

        const initialLength = watchlist.movies.length;
        watchlist.movies = watchlist.movies.filter(movie => movie.tmdbId !== parseInt(tmdbId));

        if (watchlist.movies.length === initialLength) {
            return res.status(404).json({ message: 'Movie not found in this watchlist' });
        }

        await user.save();
        res.status(200).json({ message: 'Movie removed from watchlist', watchlist });
    } catch (error) {
        console.error('Error removing movie from watchlist:', error);
        res.status(500).json({ message: 'Server error removing movie from watchlist' });
    }
};

// (Future expansion for rating and reviewing movies)
// You would need to add a schema for reviews (e.g., Review.js)
// and related routes/controllers. This can be associated with the User and Movie (by TMDB ID).

module.exports = {
    searchMovies,
    getMovieDetails,
    getRecommendations,
    addFavoriteMovie,
    removeFavoriteMovie,
    createWatchlist,
    addMovieToWatchlist,
    removeMovieFromWatchlist,
};
