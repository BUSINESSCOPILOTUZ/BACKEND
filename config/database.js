const mongoose = require("mongoose");
const { databaseUrl } = require("./config");
module.exports = async () => {
  await mongoose
    .connect(databaseUrl)
    .then(() => console.log("Databse is connected"))
    .catch((error) =>
      console.log("Error on connecting database", error.message)
    );
};
