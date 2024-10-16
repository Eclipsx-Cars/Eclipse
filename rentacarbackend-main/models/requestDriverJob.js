const mongoose = require('mongoose');

const requestedDriverJobSchema = new mongoose.Schema({
    driversNeeded: {
        type: Number,
        required: true
    },
    budget: {
        type: Number,
        required: true
    },
    daysRequired: {
        type: Number,
        required: true
    },
    contactNumber: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('RequestedDriverJob', requestedDriverJobSchema);
