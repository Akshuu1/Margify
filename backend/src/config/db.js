const moongose = require('mongoose');

const connectDB = async () => {
  try {
    await moongose.connect(process.env.MONGO_URL);
  } catch (error) {
  }
};

module.exports = { connectDB };