const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: String,
    pay: Number,
    description: String,
    taken: Boolean,
    acceptedByName: String, // Field to store the name of the user who accepted the job
    acceptedByEmail: String // Field to store the email of the user who accepted the job
});

const DriverJob = mongoose.model('DriverJob', jobSchema);

module.exports = DriverJob;
