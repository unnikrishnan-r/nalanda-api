const moment = require("moment");
const db = require("../database/models");

var Sequelize = require("sequelize");
const Op = Sequelize.Op;

module.exports = {
  calculateInvoiceAmount: async function (req, res) {
    let statusCash;
    let totalBillAmount = 0;
    let totalNetWeight = 0;
    let totaldryWeight = 0;

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
        entry.dataValues.paymentStatus = 1; //Update payment status to "Billed"
        let statusLatex = await db.LatexCollection.update(entry.dataValues, {
          where: {
            seqNumber: parseInt(entry.seqNumber),
            customerId: parseInt(entry.customerId),
          },
        });
      })
    );

    //Make Bill Generation Entries by customer
    console.log("2nd query");
    let latexSummary = await db.LatexCollection.findAll({
      attributes: [
        "customerId",
        [Sequelize.fn("SUM", Sequelize.col("totalAmount")), "totalLatexAmount"],
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
    let cashSummary = await db.CashPayment.findAll({
      attributes: [
        "customerId",
        [Sequelize.fn("SUM", Sequelize.col("totalAmount")), "totalCashAmount"],
      ],
      raw: true,
      group: ["customerId"],
      where: {
        paymentDate: {
          [Op.gte]: BillingSummaryRecord.billFromDate,
          [Op.lte]: BillingSummaryRecord.billToDate,
        },
      },
    });

    await Promise.all(
      latexSummary.map(async (customerSum) => {
        let generatedBillRecord = {};
        generatedBillRecord.customerId = customerSum.customerId;
        generatedBillRecord.totalLatexAmount = customerSum.totalLatexAmount;
        {
          cashSummary.find(
            (element) =>
              (generatedBillRecord.totalCashAmount =
                element.customerId === customerSum.customerId
                  ? element.totalCashAmount
                  : 0)
          );
        }
        {
          generatedBillRecord.totalAmount =
            generatedBillRecord.totalLatexAmount -
            generatedBillRecord.totalCashAmount;
        }
        (generatedBillRecord.paymentDate = moment(
          BillingSummaryRecord.billToDate
        ).add(1, "days")),
          (generatedBillRecord.paymentType = 0),
          (generatedBillRecord.paymentNotes = "Bill Generated on ".concat(
            moment(BillingSummaryRecord.billToDate)
              .add(1, "days")
              .format("DD/MM/YYYY")
          ));
        console.log(generatedBillRecord);
        statusCash = await db.CashPayment.upsert(generatedBillRecord);
        totalBillAmount += generatedBillRecord.totalAmount;
        totaldryWeight += customerSum.dryWeight;
        totalNetWeight += customerSum.netWeight;
      })
    );
    BillingSummaryRecord.numberOfBills = latexSummary.length;
    BillingSummaryRecord.totalBillAmount = totalBillAmount
    BillingSummaryRecord.totaldryWeight = totaldryWeight;
    BillingSummaryRecord.totalNetWeight = totalNetWeight;

    let statusBillSummary = await db.BillingSummary.upsert(
      BillingSummaryRecord
    );
    if (statusBillSummary) {
      console.log(BillingSummaryRecord);
      res.set("Access-Control-Allow-Origin", "*"),
        res.json(BillingSummaryRecord);
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
