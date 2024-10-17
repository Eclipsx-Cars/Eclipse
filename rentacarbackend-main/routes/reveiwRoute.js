const express = require("express");
const router = express.Router();
const Review = require("../models/review");

// Get all reviews
router.get("/", async (req, res) => {
    try {
        const reviews = await Review.find({});
        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: "An error occurred while retrieving reviews.", error });
    }
});

// Add a new review
router.post("/", async (req, res) => {
    try {
        const { name, content } = req.body;
        const newReview = new Review({ name, content });
        await newReview.save();
        res.status(201).json({ message: "Review added successfully.", review: newReview });
    } catch (error) {
        res.status(500).json({ message: "An error occurred while adding the review.", error });
    }
});

module.exports = router;