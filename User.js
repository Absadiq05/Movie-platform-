// server/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    password: {
        type: String,
        required: true,
    },
    favoriteMovies: [{
        tmdbId: { type: Number, unique: true }, // TMDb ID for the movie
        title: String,
        posterPath: String,
        releaseDate: String,
    }],
    watchlists: [{
        name: { type: String, required: true },
        movies: [{
            tmdbId: Number,
            title: String,
            posterPath: String,
        }]
    }],
    // You can add more fields for user profile management here
}, {
    timestamps: true, // Adds createdAt and updatedAt timestamps
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
  
