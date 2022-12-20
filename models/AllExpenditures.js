const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const moment = require("moment-timezone");

const AllExpenditures = new Schema({

    userId: { type: String, required: true },

    year: {
        type: String,
        required: true,
        month: {
            type: String,
            required: true,
            date: {
                type: String,
                required: true,
                expenditure: {
                    type: Array,
                    default: []
                }
            }
        }
    }


})

module.exports = mongoose.model("ALlExpenditurs", AllExpenditures);