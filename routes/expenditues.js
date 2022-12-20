const express = require("express");
const Expenditure = require("../models/Expenditures");
const router = express.Router();
const AllExpenditures = require("../models/AllExpenditures");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const check_auth = require("../middlewares/auth");
const User = require("../models/Users");
require("dotenv").config();
const moment = require("moment-timezone");
const { json } = require("express/lib/response");

router.get("/", (req, res) => {
  res.status(200).json({ message: "Working" });
});

router.post("/addTransactions", check_auth, async (req, res) => {
  console.log(req.body);
  const data = req.body;

  var present = moment
    .tz(Date.now(), "Asia/Calcutta")
    .format("DD MMMM YYYY HH:mm:ss");
  console.log(present);
  var present = present.split(" ");

  // var date = present[0];
  var date = present[0];
  var month = present[1];
  var year = present[2];

  var user = await User.findOne({
    _id: req.user.userId,
  });

  // user.all = {
  //   [year]: {
  //     [month]: {
  //       [date]: {
  //         value: []
  //       }
  //     }
  //   }
  // }

  var total = 0;
  req.body.forEach((element) => (total += parseFloat(element["cost"])));
  console.log(total);

  if (!user["all"][year]) {
    Object.assign(user["all"], {
      [year]: {
        total: total,
        [month]: {
          total: total,
          [date]: {
            total: total,
            expenditure: req.body,
          },
        },
      },
    });
    await user.updateOne({ all: user["all"] });
  } else if (!user["all"][year][month]) {
    // let total = 0;
    // req.body.forEach((element)=> total+=parseFloat(element["cost"]) );
    yeartotal = parseFloat(user["all"][year]["total"]) + total;

    Object.assign(user["all"][year], {
      total: yeartotal,
      [month]: {
        total: total,
        [date]: {
          total: total,
          expenditure: req.body,
        },
      },
    });
    await user.updateOne({ all: user["all"] });
  } else if (!user["all"][year][month][date]) {
    console.log("date not found");
    // var value = `all.${year}.${month}`

    // let total =0
    // req.body.forEach((element)=> total+=parseFloat(element["cost"]) );

    yeartotal = parseFloat(user["all"][year]["total"]) + total;

    monthtotal = parseFloat(user["all"][year][month]["total"]) + total;

    user["all"][year]["total"] = yeartotal;

    Object.assign(user["all"][year][month], {
      total: monthtotal,
      [date]: {
        total: total,
        expenditure: req.body,
      },
    });

    await user.updateOne({ all: user["all"] });
  } else {
    yeartotal = parseFloat(user["all"][year]["total"]) + total;

    monthtotal = parseFloat(user["all"][year][month]["total"]) + total;

    daytotal = parseFloat(user["all"][year][month][date]["total"]) + total;

    user["all"][year][month][date]["total"] = daytotal;
    user["all"][year][month]["total"] = monthtotal;
    user["all"][year]["total"] = yeartotal;

    AllExpenses = user["all"][year][month][date]["expenditure"];

    console.log(AllExpenses);

    var values = req.body;

    AllExpenses.push(...values);

    console.log(AllExpenses);

    user["all"][year][month][date]["expenditure"] = AllExpenses;

    await user.updateOne({ all: user["all"] });

    // return res.json(user);
  }

  // console.log(user["all"].get("2022"));
  // var dat = user["all"].get("2022");
  // console.log(dat["March"]);

  console.log(user);
  await user.save();

  return res.json(user);

  // const DaysTransactions = await Expenditure.findOne({
  //   userId: req.user.userId,
  //   // date: data.date,
  // });

  // var user = req.user;
  // console.log(user);
  // if (!DaysTransactions) {
  //   const Transactions = await new Expenditure({
  //     userId: req.user.userId,
  //     // date: data.date,
  //     transactions: data.transactions,
  //   });

  //   var user  = await User.findById(req.user.userId);

  //   await Transactions.save();
  //   console.log("years",user.years);
  //   if(!user.years.includes(Transactions["year"]))
  //   {
  //     await user.updateOne({
  //       $push:{
  //         years: Transactions["year"]
  //       }
  //     })
  //   }

  //   res.status(200).json({ message: "saved" });
  // } else {
  //   var user  = await User.findById(req.user.userId);
  //   const tlength = DaysTransactions.transactions.length;
  //   data.transactions.forEach((t, i) => {
  //     t.id = tlength + i;
  //     DaysTransactions.transactions.push(t);
  //   });
  //   await DaysTransactions.save();
  //   console.log(DaysTransactions);

  //     console.log("years",user.years);
  //   if(!user.years.includes(DaysTransactions["year"]))
  //   {
  //     await user.updateOne({
  //       $push:{
  //         years: DaysTransactions["year"]
  //       }
  //     })
  //   }

  //   res.status(200).json({ message: "Add saved" });

  // }
});

router.get("/getTransactions", check_auth, async (req, res) => {
  const data = await Expenditure.find({
    userId: req.user.userId,
  });
  console.log(data);
  return res.status(200).json(data);
});

router.get("/getYears", check_auth, async (req, res) => {
  const data = await User.findOne({
    _id: req.user.userId,
  });

  var All = data.all;
  console.log(typeof All);

  var keys = Object.keys(All);
  var totals = [];
  keys.forEach((e) => totals.push(All[e]["total"]));
  // keys.pop("total");
  console.log(keys, totals);

  return res.json({ data: keys, totals: totals });
  // return res.status(200).json(data.years)
});

router.post("/getMonths", check_auth, async (req, res) => {
  var year = req.body.year;
  const data = await User.findOne({
    _id: req.user.userId,
  });

  var All = data.all;
  var keys = Object.keys(All[year]);
  console.log(keys);
  keys.splice(keys.indexOf("total"), 1);

  var totals = [];
  keys.forEach((e) => totals.push(All[year][e]["total"]));

  console.log(keys, totals);
  // console.log(typeof All);
  return res.json({ data: keys, totals: totals });
});

router.post("/getDates", check_auth, async (req, res) => {
  var year = req.body.year;
  var month = req.body.month;

  console.log("body", req.body);

  const data = await User.findOne({
    _id: req.user.userId,
  });

  var All = data["all"];

  var keys = Object.keys(All[year][month]);
  var totals = [];

  keys.splice(keys.indexOf("total"), 1);
  keys.forEach((e) => totals.push(All[year][month][e]["total"]));

  console.log(keys, totals);

  var All = data.all;
  console.log(typeof All);
  return res.json({ data: keys, totals: totals });
});

router.post("/getDatesExpenditures", check_auth, async (req, res) => {
  console.log(req.body);
  var year = req.body.year;
  var month = req.body.month;
  var date = req.body.day;
  const data = await User.findOne({
    _id: req.user.userId,
  });

  console.log(date);
  // console.log(data);

  //  var All = data.all;
  // console.log(typeof All);
  console.log(data["all"][year][month][date]);
  // console.log(data["all"][year][month][date]["expenditure"])
  return res.json(data["all"][year][month][date]["expenditure"]);
});

router.get("/getToday", check_auth, async (req, res) => {
  var present = moment
    .tz(Date.now(), "Asia/Calcutta")
    .format("DD MMMM YYYY HH:mm:ss");
  console.log(present);
  var present = present.split(" ");

  var date = present[0];
  var month = present[1];
  var year = present[2];

  var user = await User.findOne({
    _id: req.user.userId,
  });

  console.log(user);

  if (!user["all"][year]) {
    console.log("year");
    return res.json({ data: [], message: "add something" });
  } else if (!user["all"][year][month]) {
    console.log("month");
    return res.json({ data: [], message: "add something" });
  } else if (!user["all"][year][month][date]) {
    console.log("date");
    return res.json({ data: [], message: "add something" });
  } else {
    // console.log("day")
    console.log("im herer");
    return res.json({
      data: user["all"][year][month][date].expenditure,
      message: "data sent",
      total: user["all"][year][month][date].total,
    });
  }
});

module.exports = router;
