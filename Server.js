// server/server.js
require('dotenv').config(); // Load environment variables
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const movieRoutes = require('./routes/movieRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Enable CORS for all origins, you might want to restrict this in production
app.use(express.json()); // Parse JSON bodies

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/users', userRoutes); // User authentication routes
app.use('/api/movies', movieRoutes); // Movie related routes (search, save, etc.)

// Simple root route for testing
app.get('/', (req, res) => {
    res.send('Movie Recommendation API is running!');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
