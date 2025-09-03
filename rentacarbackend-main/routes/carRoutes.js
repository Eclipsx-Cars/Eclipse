require("dotenv").config();
const config = require("../utils/config");
const mongodb = require("mongodb");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const Car = require("../models/car");
const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");

const mongoURI = config.MONGODB_URI;

const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return {
      filename: `${Date.now()}-${file.originalname}`,
      bucketName: "uploads.files"  // This matches your collection name
    };
  },
});

const upload = multer({ storage });

// Get all cars
router.get("/", async (req, res) => {
  try {
    const cars = await Car.find({});
    res.status(200).json(cars);
  } catch (error) {
    res.status(500).json({ message: "An error occurred while retrieving cars.", error });
  }
});

// Get a single car by ID
router.get("/:carId", async (req, res) => {
  const { carId } = req.params;
  try {
    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({ message: "Car not found." });
    }
    res.status(200).json(car);
  } catch (error) {
    res.status(500).json({ message: "An error occurred while retrieving the car.", error });
  }
});

// Add a car with images
router.post("/", upload.array("images"), async (req, res) => {
  try {
    const { make, model, year, description, price, CarForReason } = req.body;
    const files = req.files;

    if (!make || !model || !year) {
      return res.status(400).json({ message: "Please provide all required fields." });
    }

    const newCar = new Car({
      make,
      model,
      year,
      description,
      price,
      CarForReason,
      images: files ? files.map(file => `/api/cars/image/${file.filename}`) : []
    });

    await newCar.save();
    res.status(201).json({ message: "Car added successfully.", car: newCar });
  } catch (error) {
    res.status(500).json({ message: "An error occurred while adding the car.", error });
  }
});

// Update car details and images
router.put("/:carId", upload.array("images"), async (req, res) => {
  try {
    const { carId } = req.params;
    const { make, model, year, description, price, CarForReason } = req.body;
    const files = req.files;

    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({ message: "Car not found." });
    }

    if (make) car.make = make;
    if (model) car.model = model;
    if (year) car.year = year;
    if (description) car.description = description;
    if (price) car.price = price;
    if (CarForReason) car.CarForReason = CarForReason;

    if (files && files.length > 0) {
      if (car.images && car.images.length > 0) {
        const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
          bucketName: "uploads.files"
        });

        for (const imageUrl of car.images) {
          const oldImageFilename = imageUrl.split("/").pop();
          try {
            const oldFile = await bucket.find({ filename: oldImageFilename }).toArray();
            if (oldFile.length > 0) {
              await bucket.delete(oldFile[0]._id);
            }
          } catch (error) {
            console.error("Error deleting old image:", error);
          }
        }
      }
      car.images = files.map(file => `/api/cars/image/${file.filename}`);
    }

    await car.save();
    res.status(200).json({ message: "Car updated successfully.", car });
  } catch (error) {
    res.status(500).json({ message: "Error updating car.", error });
  }
});

// Delete a car
router.delete("/:carId", async (req, res) => {
  try {
    const { carId } = req.params;
    const car = await Car.findById(carId);

    if (!car) {
      return res.status(404).json({ message: "Car not found." });
    }

    if (car.images && car.images.length > 0) {
      const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
        bucketName: "uploads.files"
      });

      for (const imageUrl of car.images) {
        const imageFilename = imageUrl.split("/").pop();
        try {
          const file = await bucket.find({ filename: imageFilename }).toArray();
          if (file.length > 0) {
            await bucket.delete(file[0]._id);
          }
        } catch (error) {
          console.error("Error deleting image:", error);
        }
      }
    }

    await Car.findByIdAndDelete(carId);
    res.status(200).json({ message: "Car removed successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error deleting car.", error });
  }
});

// Get image by filename
router.get("/image/:filename", async (req, res) => {
  const filename = req.params.filename;
  try {
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: "uploads.files"
    });

    const files = await bucket.find({ filename }).toArray();

    if (!files || files.length === 0) {
      return res.status(404).json({ message: "Image not found." });
    }

    if (files[0].contentType.startsWith('image/')) {
      res.set('Content-Type', files[0].contentType);
      const downloadStream = bucket.openDownloadStreamByName(filename);
      downloadStream.pipe(res);
    } else {
      res.status(404).json({ message: "Not an image." });
    }
  } catch (error) {
    console.error('Error retrieving image:', error);
    res.status(500).json({ message: "Error retrieving image.", error });
  }
});

module.exports = router;