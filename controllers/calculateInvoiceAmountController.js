const moment = require("moment");
const db = require("../database/models");

var Sequelize = require("sequelize");
const Op = Sequelize.Op;

const billingSummaryController = require("./billingSummaryController");

module.exports = {
  calculateInvoiceAmount: async function (req, res) {
    //Insert record in to Billing Summary Table
    let BillingSummaryRecord = {
      billPeriod: moment(req.body.billToDate)
        .format("YYYY")
        .concat(moment(req.body.billToDate).format("MM")),
      billDate: moment(req.body.billToDate).format(),
      billToDate: req.body.billToDate,
      billFromDate: req.body.billFromDate,
      unitRatePerKg: req.body.unitRatePerKg,
    };
    console.log(BillingSummaryRecord);

    //Find all latex entries that needs to be updated
    let latexEntries = await db.LatexCollection.findAll({
      where: {
        collectionDate: {
          [Op.gte]: BillingSummaryRecord.billFromDate,
          [Op.lte]: BillingSummaryRecord.billToDate,
        },
      },
    });

    //Calculate and update invoice amount for each latex entry
    //Refer https://gist.github.com/joeytwiddle/37d2085425c049629b80956d3c618971 to see why forEach would not work here
    await Promise.all(
      latexEntries.map(async (entry) => {
        entry.dataValues.unitRatePerKg = BillingSummaryRecord.unitRatePerKg;
        entry.dataValues.totalAmount =
          entry.dataValues.dryWeight * BillingSummaryRecord.unitRatePerKg;
        let statusLatex = await db.LatexCollection.update(entry.dataValues, {
          where: {
            seqNumber: parseInt(entry.seqNumber),
            customerId: parseInt(entry.customerId),
          },
        });
      })
    );

    //Make Bill Generation Entries by customer
    let cashPaymentEntries = await db.LatexCollection.findAll({
      attributes: [
        "customerId",
        [Sequelize.fn("SUM", Sequelize.col("totalAmount")), "totalAmount"],
        [Sequelize.fn("SUM", Sequelize.col("netWeight")), "netWeight"],
        [Sequelize.fn("SUM", Sequelize.col("dryWeight")), "dryWeight"],
      ],
      raw: true,
      group: ["customerId"],
      where: {
        collectionDate: {
          [Op.gte]: BillingSummaryRecord.billFromDate,
          [Op.lte]: BillingSummaryRecord.billToDate,
        },
      },
    });

    let statusCash;
    let totalBillAmount = 0;
    let totalNetWeight = 0;
    let totaldryWeight = 0;
    await Promise.all(
      cashPaymentEntries.map(async (cashEntry) => {
        console.log(cashEntry);
        (cashEntry.paymentDate = BillingSummaryRecord.billToDate),
          (cashEntry.paymentType = 1),
          (cashEntry.paymentNotes = "Bill Generated on ".concat(
            moment(BillingSummaryRecord.billToDate).format("DD/MM/YYYY")
          ));
        statusCash = await db.CashPayment.upsert(cashEntry);
        totalBillAmount += cashEntry.totalAmount;
        totaldryWeight += cashEntry.dryWeight;
        totalNetWeight += cashEntry.netWeight;
      })
    );
    BillingSummaryRecord.numberOfBills = cashPaymentEntries.length;
    BillingSummaryRecord.totalBillAmount = totalBillAmount;
    BillingSummaryRecord.totaldryWeight = totaldryWeight;
    BillingSummaryRecord.totalNetWeight = totalNetWeight;

    let statusBillSummary = await db.BillingSummary.upsert(
      BillingSummaryRecord
    );
    if (statusBillSummary) {
      console.log(BillingSummaryRecord);
      res.set("Access-Control-Allow-Origin", "*"), res.json(BillingSummaryRecord);
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
