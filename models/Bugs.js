

// models/Bug.js
const mongoose = require('mongoose');

const BugSchema = new mongoose.Schema({
    page: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        default: '/images/placeholder.png'
    },
    status: {
        type: String,
        enum: ['open', 'in-progress', 'resolved', 'cancelled'],
        default: 'open'
    },
    creator: {
        type: String,
        required: true
    },
    creatorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt field on save
BugSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const Bug = mongoose.model('Bug', BugSchema);

module.exports = Bug;