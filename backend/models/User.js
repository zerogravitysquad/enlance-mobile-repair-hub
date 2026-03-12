/**
 * User Model
 * Represents users, shopkeepers, and admins in the system
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email'
        ]
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false // Don't include password in queries by default
    },
    role: {
        type: String,
        enum: ['user', 'shopkeeper', 'admin'],
        default: 'user'
    },
    city: {
        type: String,
        required: function () {
            return this.role === 'shopkeeper'; // Required only for shopkeepers
        }
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    ratingCount: {
        type: Number,
        default: 0
    },
    verified: {
        type: Boolean,
        default: false // Shopkeepers need admin verification
    },
    locationLink: {
        type: String,
        default: '' // Google Maps URL for shopkeeper location
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

/**
 * Pre-save middleware to hash password before saving
 */
userSchema.pre('save', async function (next) {
    // Only hash password if it has been modified (or is new)
    if (!this.isModified('password')) {
        return next();
    }

    // Generate salt and hash password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

/**
 * Method to compare entered password with hashed password
 * @param {String} enteredPassword - Password to compare
 * @returns {Boolean} - True if passwords match
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

/**
 * Method to update shopkeeper rating
 * @param {Number} newRating - New rating to add (1-5)
 */
userSchema.methods.updateRating = function (newRating) {
    const totalRating = (this.rating * this.ratingCount) + newRating;
    this.ratingCount += 1;
    this.rating = totalRating / this.ratingCount;
};

module.exports = mongoose.model('User', userSchema);
