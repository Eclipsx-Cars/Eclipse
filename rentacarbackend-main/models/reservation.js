const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  carId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Car",
    required: true,
  },
  carMake: {
    type: String,
    required: true,
  },
  carModel: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  startTime: {  // New field, optional
    type: String, // Assuming time is stored as a string in HH:mm format
    required: false, // Not required
  },
  endTime: {    // New field, optional
    type: String, // Assuming time is stored as a string in HH:mm format
    required: false, // Not required
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  remainingToPay: {
    type: Number,
    required: true,
  },
  currentPaid: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

reservationSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Reservation", reservationSchema);
