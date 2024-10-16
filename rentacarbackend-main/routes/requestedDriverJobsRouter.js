const express = require("express");
const RequestedDriverJob = require("../models/requestDriverJob");
const router = express.Router();

// POST route to request a new driver job
router.post("/", async (req, res) => {
    try {
        const { driversNeeded, budget, daysRequired, contactNumber, description } = req.body;

        const newDriverJob = new RequestedDriverJob({
            driversNeeded,
            budget,
            daysRequired,
            contactNumber,
            description,
        });

        await newDriverJob.save();
        res.status(201).json({ message: "Driver job requested successfully", job: newDriverJob });
    } catch (error) {
        res.status(500).json({ message: "An error occurred while requesting the job.", error });
    }
});

// Optionally, add GET route to fetch all requested jobs
router.get("/", async (req, res) => {
    try {
        const jobs = await RequestedDriverJob.find({});
        res.status(200).json(jobs);
    } catch (error) {
        res.status(500).json({ message: "An error occurred while fetching jobs.", error });
    }
});

module.exports = router;
