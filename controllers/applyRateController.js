const moment = require("moment");
const db = require("../database/models");

var Sequelize = require("sequelize");
const Op = Sequelize.Op;

module.exports = {
  applyRate: async function (req, res) {
    console.log("In Apply Rate")
    //Find all latex entries that needs to be updated
    let latexEntries = await db.LatexCollection.findAll({
      where: {
        collectionDate: {
          [Op.gte]: req.body.billFromDate,
          [Op.lte]: req.body.billToDate,
        },
      },
    });

    //Calculate and update total amount for each latex entry
    //Refer https://gist.github.com/joeytwiddle/37d2085425c049629b80956d3c618971 to see why forEach would not work here
    let latexUpdateStatus = await Promise.all(
      latexEntries.map(async (entry) => {
        entry.dataValues.unitRatePerKg = req.body.unitRatePerKg;
        entry.dataValues.totalAmount =
          entry.dataValues.dryWeight * req.body.unitRatePerKg;
        await db.LatexCollection.update(entry.dataValues, {
          where: {
            seqNumber: parseInt(entry.seqNumber),
            customerId: parseInt(entry.customerId),
          },
        });
      })
    );

    if (latexUpdateStatus) {
      res.set("Access-Control-Allow-Origin", "*"),
        res.json("Latex Entries Updated");
    } else {
      res.status(422);
    }
  },

  options: function (req, res) {
    res.set({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "*",
      "Access-Control-Allow-Headers":
        "Origin, X-Requested-With, Content-Type, Accept",
      "Content-Type": "application/json",
    }),
      res.json();
  },
};
