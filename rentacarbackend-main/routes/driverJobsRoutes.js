const express = require("express");
const DriverJob = require("../models/job,"); // Corrected file path to the Job model
const router = express.Router();

// Handle GET request to fetch all jobs
router.get("/", async (req, res) => {
    try {
        const jobs = await DriverJob.find({});
        res.status(200).json(jobs);
    } catch (error) {
        res.status(500).json({ message: "An error occurred while fetching jobs.", error });
    }
});

// Handle POST request to add a new job
router.post("/", async (req, res) => {
    try {
        const { title, pay, description } = req.body;

        const newJob = new DriverJob({
            title,
            pay,
            description,
            taken: false,
        });

        await newJob.save();
        res.status(201).json({ message: "Job added successfully.", job: newJob });
    } catch (error) {
        res.status(500).json({ message: "An error occurred while adding the job.", error });
    }
});

// Handle PUT request to update a job by ID
router.put("/:id", async (req, res) => {
    try {
        const { title, pay, description, taken, acceptedByName, acceptedByEmail } = req.body;
        const jobId = req.params.id;

        const updatedJob = await DriverJob.findByIdAndUpdate(
            jobId,
            { title, pay, description, taken, acceptedByName, acceptedByEmail },
            { new: true }
        );

        if (!updatedJob) {
            return res.status(404).json({ message: "Job not found." });
        }

        res.status(200).json({ message: "Job updated successfully.", job: updatedJob });
    } catch (error) {
        res.status(500).json({ message: "An error occurred while updating the job.", error });
    }
});

// Handle DELETE request to delete a job by ID
router.delete("/:id", async (req, res) => {
    try {
        const jobId = req.params.id;

        const deletedJob = await DriverJob.findByIdAndDelete(jobId);

        if (!deletedJob) {
            return res.status(404).json({ message: "Job not found." });
        }

        res.status(200).json({ message: "Job deleted successfully." });
    } catch (error) {
        res.status(500).json({ message: "An error occurred while deleting the job.", error });
    }
});

module.exports = router;
