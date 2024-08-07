require('dotenv').config(); // Load environment variables
const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const dbUrl = process.env.ATLASDB_LINK;

const main = async () => {
  try {
    console.log("Database URL:", dbUrl); // Log the DB URL for debugging
    await mongoose.connect(dbUrl);
    console.log("Connected to Database Successfully");
    await initDb();
  } catch (err) {
    console.error("Database connection error:", err);
  } finally {
    mongoose.connection.close();
  }
};

const initDb = async () => {
  try {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({
      ...obj,
      owner: "66b227264023ff10f16aa5d0",
      geometry:{type:"Point", coordinates: [79.0821, 21.1498]},
    }));
    await Listing.insertMany(initData.data);
    console.log("Data was saved");
  } catch (error) {
    console.error("Error initializing the database:", error);
  }
};

main();