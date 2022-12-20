const express = require("express");
const mongoose = require("mongoose");
const app = express();
const cors = require("cors");
require("dotenv").config();
app.use(
  cors({
    origin: ["*"],
    credentials: true,
  })
);
app.use(express.json());

mongoose.connect(
  process.env.MONGODB_URL,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err) => {
    console.log(err);
  }
);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("Connected");
});

const userRoute = require("./routes/users");
app.use("/user", userRoute);

const ExpenditureRoute = require("./routes/expenditues");
app.use("/expenditures", ExpenditureRoute);

app.get("/", (req, res) => {
  res.json("Welcome to SS tech")
});

const port = process.env.PORT || 9000;

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
