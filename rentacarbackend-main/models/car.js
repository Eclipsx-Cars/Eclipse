// models/Car.js
const mongoose = require("mongoose");

const CarSchema = new mongoose.Schema({
  make: {
    type: String,
    required: true,
  },
  model: {
    type: String,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
  },
  price: {
    type: String,
    required: true,
  },
  images: [{
    type: String,
  }],
  CarForReason: {
    type: String,
    enum: ['MusicVideo', 'Chauffeur'],
    required: true,
  }
});

CarSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Car", CarSchema);
