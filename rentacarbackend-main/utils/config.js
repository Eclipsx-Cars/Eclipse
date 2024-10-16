require("dotenv").config();

const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY
// const PORT = process.env.PORT;
module.exports = {
  MONGODB_URI,
  JWT_SECRET,
  STRIPE_SECRET_KEY
};
