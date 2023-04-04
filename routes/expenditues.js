const express = require("express");
const Expenditure = require("../models/Expenditures");
const router = express.Router();
const check_auth = require("../middlewares/auth");
const User = require("../models/Users");
require("dotenv").config();

router.get("/", (req, res) => {
  res.status(200).json({ message: "Working" });
});

router.post("/addTransactions", check_auth, async (req, res) => {
  const formatter = new Intl.NumberFormat('en-US', {
   minimumFractionDigits: 0,      
   maximumFractionDigits: 2,
});
  
  const now = req.body.pop();

  var date = now["date"];
  var month = now["month"];
  var year = now["year"];

  var user = await User.findOne({
    _id: req.user.userId,
  });

  var total = 0;
  req.body.forEach((element) => (total += parseFloat(element["cost"])));
  
  total = formatter.format(total);
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
    yeartotal = formater.format(parseFloat(user["all"][year]["total"]) + total);

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

    yeartotal = formatter.format(parseFloat(user["all"][year]["total"]) + total);

    monthtotal = formatter.format(parseFloat(user["all"][year][month]["total"]) + total);

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
    console.log("body ",req.body);
    yeartotal = formatter.format(parseFloat(user["all"][year]["total"]) + total);

    monthtotal = formatter.format(parseFloat(user["all"][year][month]["total"]) + total);

    daytotal = formatter.format(parseFloat(user["all"][year][month][date]["total"]) + total);

    user["all"][year][month][date]["total"] = daytotal;
    user["all"][year][month]["total"] = monthtotal;
    user["all"][year]["total"] = yeartotal;

    AllExpenses = user["all"][year][month][date]["expenditure"];

    var values = req.body;

    AllExpenses.push(...values);

    user["all"][year][month][date]["expenditure"] = AllExpenses;

    await user.updateOne({ all: user["all"] });
  }

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

  return res.status(200).json(data);
});

router.get("/getYears", check_auth, async (req, res) => {
  const data = await User.findOne({
    _id: req.user.userId,
  });

  var All = data.all;

  var keys = Object.keys(All);
  var totals = [];
  keys.forEach((e) => totals.push(All[e]["total"]));

  return res.json({ data: keys, totals: totals });
});

router.post("/getMonths", check_auth, async (req, res) => {
  var year = req.body.year;
  const data = await User.findOne({
    _id: req.user.userId,
  });

  var All = data.all;
  var keys = Object.keys(All[year]);

  keys.splice(keys.indexOf("total"), 1);

  var totals = [];
  keys.forEach((e) => totals.push(All[year][e]["total"]));

  return res.json({ data: keys, totals: totals });
});

router.post("/getDates", check_auth, async (req, res) => {
  var year = req.body.year;
  var month = req.body.month;

  const data = await User.findOne({
    _id: req.user.userId,
  });

  var All = data["all"];

  var keys = Object.keys(All[year][month]);
  var totals = [];

  keys.splice(keys.indexOf("total"), 1);
  keys.forEach((e) => totals.push(All[year][month][e]["total"]));

  var All = data.all;

  return res.json({ data: keys, totals: totals });
});

router.post("/getDatesExpenditures", check_auth, async (req, res) => {
  var year = req.body.year;
  var month = req.body.month;
  var date = req.body.day;
  const data = await User.findOne({
    _id: req.user.userId,
  });
  
  
  console.log(date);

  console.log(data["all"][year][month][date]);

  return res.json(data["all"]?.[year]?.[month]?.[date]?.["expenditure"]||data["all"]?.[year]?.[month]?.[parseInt(date)]?.["expenditure"]);
});

router.post("/getToday", check_auth, async (req, res) => {
  var body = req.body;

  var date = body["date"];
  var month = body["month"];
  var year = body["year"];

  var user = await User.findOne({
    _id: req.user.userId,
  });

  console.log("getting todays data");

  if (!user["all"][year]) {
    console.log("new year");
    return res.json({ data: [], message: "add something" });
  } else if (!user["all"][year][month]) {
    console.log("new month in same year");
    return res.json({ data: [], message: "add something" });
  } else if (!user["all"][year][month][date]) {
    console.log("new date in same month");
    return res.json({ data: [], message: "add something" });
  } else {
    console.log("adding a new expenditure for the day");
    return res.json({
      data: user["all"][year][month][date].expenditure,
      message: "data sent",
      total: user["all"][year][month][date].total,
    });
  }
});

module.exports = router;
