const express = require("express");
const router = express.Router();
const Reservation = require("../models/reservation");
const mongoose = require("mongoose");
const config = require("../utils/config");
const logger = require("../utils/logger");
const stripe = require('stripe')(config.STRIPE_SECRET_KEY);

// Create a new reservation
router.post("/", async (req, res) => {
  try {
    const { user, carId, carMake, carModel, startDate, endDate, startTime, endTime, totalPrice, remainingToPay, currentPaid } =
        req.body;
    logger.info(`Request body: ${JSON.stringify(req.body)}`);
    logger.info(`Creating reservation for user ${user} and car ${carMake}`);

    const reservation = new Reservation({
      user,
      carId,
      carMake,
      carModel,
      startDate,
      endDate,
      startTime: startTime || null,  // Allow for optional startTime
      endTime: endTime || null,        // Allow for optional endTime
      totalPrice,
      remainingToPay,
      currentPaid // Initialize currentPaid with the deposit amount
    });

    await reservation.save();
    res.status(201).json(reservation);
    logger.info(`Reservation created successfully`);
  } catch (error) {
    console.error("Error creating reservation:", error);
    logger.error(`An error occurred while creating the reservation: ${error}`);
    res.status(500).json({ message: "An error occurred while creating the reservation." });
  }
});

// get reservations by car
router.get("/car/:carId", async (req, res) => {
  try {
    console.log(
      `fetching reservations for car with id of: ${req.params.carId}`
    );
    const reservations = await Reservation.find({ carId: req.params.carId });
    res.json(reservations);
    console.log(reservations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all reservations for a user
router.get("/user/:userId", async (req, res) => {
  try {
    console.log(req.params.userId);
    const reservations = await Reservation.find({ user: req.params.userId });
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all reservations
router.get("/", async (req, res) => {
  try {
    const reservations = await Reservation.find({})
        .populate("user")
        .populate("carId");
    res.status(200).json(reservations);
  } catch (error) {
    console.error("Error retrieving reservations:", error);
    res
        .status(500)
        .json({ message: "An error occurred while retrieving reservations." });
  }
});

// Get a single reservation by ID
router.get("/:reservationId", async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.reservationId)
      .populate("user")
      .populate("car");
    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found." });
    }
    res.status(200).json(reservation);
  } catch (error) {
    console.error("Error retrieving reservation:", error);
    res
      .status(500)
      .json({ message: "An error occurred while retrieving the reservation." });
  }
});

//add make/model
// Update a reservation
router.put("/:reservationId", async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.reservationId);

    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found." });
    }

    // Extract fields from request body
    const { currentPaid: amountPaidInThisTransaction, startTime, endTime } = req.body;

    // Update startTime and endTime if provided
    if (startTime) reservation.startTime = startTime; // Only update if present
    if (endTime) reservation.endTime = endTime;       // Only update if present

    // Ensure currentPaid is a valid number
    const validCurrentPaid = !isNaN(amountPaidInThisTransaction) ? amountPaidInThisTransaction : 0;

    // Increment currentPaid by the amount just paid
    reservation.currentPaid += validCurrentPaid;

    // Calculate remainingToPay based on the total price and updated currentPaid
    reservation.remainingToPay = reservation.totalPrice - reservation.currentPaid;

    // Ensure remainingToPay doesn't go below zero
    if (reservation.remainingToPay < 0) {
      reservation.remainingToPay = 0;
    }

    // Save the updated reservation
    await reservation.save();

    res.status(200).json(reservation);
  } catch (error) {
    console.error("Error updating reservation:", error);
    res.status(500).json({ message: "An error occurred while updating the reservation." });
  }
});


// Delete a reservation
router.delete("/:reservationId", async (req, res) => {
  try {
    const { reservationId } = req.params;

    const reservation = await Reservation.findById(reservationId);

    if (!reservation) {
      console.log("Reservation not found:", reservationId);
      return res.status(404).json({ message: "Reservation not found." });
    }

    await Reservation.deleteOne({ _id: reservationId });

    console.log("Reservation removed successfully:", reservationId);
    res.status(200).json({ message: "Reservation removed successfully." });
  } catch (error) {
    console.error("Error while removing the reservation:", error);
    res.status(500).json({
      message: "An error occurred while removing the reservation.",
      error,
    });
  }
});

router.post("/:reservationId/pay", async (req, res) => {
  const { amount } = req.body;
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: "gbp",
    });
    res.status(201).json({ client_secret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    res.status(500).json({ message: "An error occurred while creating the payment intent." });
  }
});

router.post('/create-payment-intent', async (req, res) => {
  const { amount, currency, userId } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata: { userId },
    });

    res.json({ client_secret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
