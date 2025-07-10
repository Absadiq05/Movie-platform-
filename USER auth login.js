// server/controllers/userController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Helper function to generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '1h', // Token expires in 1 hour
    });
};

// @desc    Register new user
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Please enter all fields' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    try {
        const user = await User.create({ username, email, password });
        res.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

// @desc    Authenticate user & get token
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            token: generateToken(user._id),
        });
    } else {
        res.status(400).json({ message: 'Invalid credentials' });
    }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
    // req.user is set by the protect middleware
    res.json({
        _id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        favoriteMovies: req.user.favoriteMovies,
        watchlists: req.user.watchlists,
        // ... other profile data
    });
};

// @desc    Update user profile (e.g., username, email, etc.)
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    const user = await User.findById(req.user._id); // User from `protect` middleware

    if (user) {
        user.username = req.body.username || user.username;
        user.email = req.body.email || user.email;

        if (req.body.password) { // Handle password update
            user.password = req.body.password; // The pre-save hook in model will hash it
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            username: updatedUser.username,
            email: updatedUser.email,
            token: generateToken(updatedUser._id),
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
};
