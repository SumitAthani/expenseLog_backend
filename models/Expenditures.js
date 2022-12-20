const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const moment= require("moment-timezone");

const ExpendituresSchema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    default: moment.tz(Date.now(), "Asia/Calcutta").format("DD MMMM YYYY HH:mm:ss")

  },
  month:{
    type: String,
    default: moment.tz(Date.now(), "Asia/Calcutta").format("MM")
  },
  year:{
    type: String,
    default: moment.tz(Date.now(), "Asia/Calcutta").format("YYYY")
  },
  time: {
    type: String,
    default: moment.tz(Date.now(), "Asia/Calcutta").format("HH:mm:ss")
  },
  transactions: [],
});

module.exports = mongoose.model("Expenditures", ExpendituresSchema);
