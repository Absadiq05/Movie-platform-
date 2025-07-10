// client/src/pages/MovieDetails.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './MovieDetails.css'; // Styling for movie details

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000/api';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/original'; // For larger posters/backdrops
const TMDB_POSTER_SMALL = 'https://image.tmdb.org/t/p/w500';

function MovieDetails() {
    const { id } = useParams();
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchMovieDetails = async () => {
            setLoading(true);
            setError('');
            try {
                const res = await axios.get(`${API_URL}/movies/${id}`);
                setMovie(res.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching movie details:', err);
                setError('Failed to fetch movie details. Please try again.');
                setLoading(false);
            }
        };

        fetchMovieDetails();
    }, [id]);

    if (loading) return <div className="movie-details-container">Loading movie details...</div>;
    if (error) return <div className="movie-details-container error-message">{error}</div>;
    if (!movie) return <div className="movie-details-container">Movie not found.</div>;

    const getGenreNames = (genres) => {
        return genres ? genres.map(genre => genre.name).join(', ') : 'N/A';
    };

    const getCast = (credits) => {
        return credits && credits.cast ? credits.cast.slice(0, 5).map(member => member.name).join(', ') : 'N/A';
    };

    const getTrailer = (videos) => {
        const trailer = videos && videos.results.find(vid => vid.type === 'Trailer' && vid.site === 'YouTube');
        return trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;
    };

    return (
        <div className="movie-details-container">
            <div className="movie-backdrop" style={{ backgroundImage: `url(${TMDB_IMAGE_BASE_URL}${movie.backdrop_path})` }}>
                <div className="overlay"></div>
                <div className="movie-info-header">
                    <img
                        src={movie.poster_path ? `${TMDB_POSTER_SMALL}${movie.poster_path}` : 'https://via.placeholder.com/200x300?text=No+Image'}
                        alt={movie.title}
                        className="movie-details-poster"
                    />
                    <div className="header-text">
                        <h1>{movie.title} ({movie.release_date ? movie.release_date.substring(0, 4) : 'N/A'})</h1>
                        <p className="tagline">{movie.tagline}</p>
                        <p><strong>Rating:</strong> {movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'} / 10 ({movie.vote_count} votes)</p>
                        <p><strong>Genres:</strong> {getGenreNames(movie.genres)}</p>
                    </div>
                </div>
            </div>

            <div className="movie-details-content">
                <h2>Overview</h2>
                <p>{movie.overview}</p>

                <h2>Cast</h2>
                <p>{getCast(movie.credits)}</p>

                {getTrailer(movie.videos) && (
                    <>
                        <h2>Trailer</h2>
                        <div className="video-container">
                            <iframe
                                width="560"
                                height="315"
                                src={`https://www.youtube.com/embed/${getTrailer(movie.videos).split('v=')[1]}`}
                                title="YouTube video player"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                    </>
                )}

                {movie.reviews && movie.reviews.results.length > 0 && (
                    <>
                        <h2>Reviews</h2>
                        <div className="reviews-list">
                            {movie.reviews.results.slice(0, 3).map(review => (
                                <div key={review.id} className="review-card">
                                    <h4>{review.author}</h4>
                                    <p>{review.content.substring(0, 300)}...</p> {/* Truncate long reviews */}
                                    <a href={review.url} target="_blank" rel="noopener noreferrer">Read More</a>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* You can add more details like production companies, budget, revenue etc. */}
            </div>
        </div>
    );
}

export default MovieDetails;
