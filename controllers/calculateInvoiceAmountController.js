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
    // await db.BillingSummary.create(BillingSummaryRecord);

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
    latexEntries.forEach((entry) => {
      entry.dataValues.unitRatePerKg = BillingSummaryRecord.unitRatePerKg;
      entry.dataValues.totalAmount =
        entry.dataValues.dryWeight * BillingSummaryRecord.unitRatePerKg;
      // let status = db.LatexCollection.update(entry.dataValues, {
      //   where: {
      //     seqNumber: parseInt(entry.seqNumber),
      //     customerId: parseInt(entry.customerId),
      //   },
      // });
    });

    //Make Bill Generation Entries by customer
    let cashPaymentEntries = await db.LatexCollection.findAll({
      attributes: [
        "customerId",
        [Sequelize.fn("SUM", Sequelize.col("totalAmount")), "totalAmount"],
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

    let status;
    cashPaymentEntries.forEach((cashEntry) => {
      (cashEntry.paymentDate = BillingSummaryRecord.billToDate),
        (cashEntry.paymentType = 1),
        (cashEntry.paymentNotes = "Bill Generated on ".concat(
          moment(BillingSummaryRecord.billToDate).format("DD/MM/YYYY")
        ));
       status = db.CashPayment.create(cashEntry);
    });

    if (status) {
      res.json("Success");
    } else {
      res.status(422);
    }
  },
};
