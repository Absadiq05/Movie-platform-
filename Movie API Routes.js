// server/routes/movieRoutes.js
const express = require('express');
const {
    searchMovies,
    getMovieDetails,
    getRecommendations,
    addFavoriteMovie,
    removeFavoriteMovie,
    createWatchlist,
    addMovieToWatchlist,
    removeMovieFromWatchlist,
} = require('../controllers/movieController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes for movie discovery
router.get('/search', searchMovies);
router.get('/:id', getMovieDetails);
router.get('/recommendations/:movieId?', getRecommendations); // movieId is optional

// Private routes for user features (favorites, watchlists)
router.post('/favorites', protect, addFavoriteMovie);
router.delete('/favorites/:tmdbId', protect, removeFavoriteMovie);

router.post('/watchlists', protect, createWatchlist);
router.post('/watchlists/:watchlistId/add', protect, addMovieToWatchlist);
router.delete('/watchlists/:watchlistId/remove/:tmdbId', protect, removeMovieFromWatchlist);

module.exports = router;
