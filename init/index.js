const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

main()
  .then(() => {
    console.log("Connected to Database Successfully");
  })
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/NestHopper");
}

const initDb = async () => {
  await Listing.deleteMany({});
  initData.data = initData.data.map((obj) => ({
    ...obj,
    owner: "66a47bb11594ecbe12613a50",
  }));
  await Listing.insertMany(initData.data);
  console.log("Data was saved");
};

initDb();
