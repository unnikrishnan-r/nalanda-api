const db = require("../database/models");
var Sequelize = require("sequelize");
var moment = require("moment");

const Op = Sequelize.Op;
const path = require("path");
const fs = require("fs");
const PDFDocument = require("pdfkit-table");
const { env } = require("process");
const uploadAPI = require("./uploadController");
async function calculateTotalLatexLine(latexData) {
  let totalLatexLine = {};
  var totalLatexAmount = 0;
  var totalGrossWeight = 0;
  var totalTareWeight = 0;
  var totalNetWeight = 0;
  var totalDryWeight = 0;
  latexData.forEach((collection) => {
    totalLatexAmount += collection.totalAmount;
    totalGrossWeight += collection.grossWeight;
    totalTareWeight += collection.tareWeight;
    totalNetWeight += collection.netWeight;
    totalDryWeight += collection.dryWeight;
  });
  totalLatexLine = {
    slno: "bold:Total",
    date: "",
    grossWt: totalGrossWeight.toLocaleString("en-IN"),
    barrelWt: totalTareWeight.toLocaleString("en-IN"),
    netWt: totalNetWeight.toLocaleString("en-IN"),
    drc: "",
    dryWt: totalDryWeight.toLocaleString("en-IN"),
    rate: "",
    amount: parseFloat(totalLatexAmount).toFixed(2).toLocaleString("en-IN"),
  };
  return totalLatexLine;
}

async function createLatexTable(latexData) {
  let latexTableJson = {};
  latexTableJson.headers = [
    { label: "Sl No", property: "slno", width: 50 },
    { label: "Date", property: "date", width: 50 },
    { label: "Gross Wt", property: "grossWt", width: 50 },
    { label: "Barrel Wt", property: "barrelWt", width: 50 },
    { label: "Net Wt", property: "netWt", width: 50 },
    { label: "DRC%", property: "drc", width: 50 },
    { label: "Dry Wt", property: "dryWt", width: 50 },
    { label: "Rate/Kg", property: "rate", width: 50 },
    { label: "Amount(Rs)", property: "amount", width: 50 },
  ];
  latexTableJson.datas = [];
  latexData.forEach((collection, index) => {
    latexTableJson.datas.push({
      slno: index + 1,
      date: moment(collection.collectionDate).format("DD/MM/YYYY"),
      grossWt: parseFloat(collection.grossWeight)
        .toFixed(2)
        .toLocaleString("en-IN"),
      barrelWt: collection.tareWeight,
      netWt: parseFloat(collection.netWeight)
        .toFixed(2)
        .toLocaleString("en-IN"),
      drc: parseFloat(collection.drcPercent).toFixed(2).toLocaleString("en-IN"),
      dryWt: parseFloat(collection.dryWeight)
        .toFixed(2)
        .toLocaleString("en-IN"),
      rate: parseFloat(collection.unitRatePerKg)
        .toFixed(2)
        .toLocaleString("en-IN"),
      amount: parseFloat(collection.totalAmount)
        .toFixed(2)
        .toLocaleString("en-IN"),
    });
  });
  latexTableJson.datas.push(await calculateTotalLatexLine(latexData));
  return latexTableJson;
}

async function createCashPaymentTable(cashPaymentData, customerBalance) {
  console.log(customerBalance);
  console.log(cashPaymentData);
  let cashPaymentTableJson = {};
  cashPaymentTableJson.headers = [
    { label: "Sl No", property: "slno", width: 50 },
    { label: "Date", property: "date", width: 50 },
    { label: "Particulars", property: "notes", width: 200 },
    { label: "Debit", property: "debitAmount", width: 50 },
    { label: "Credit", property: "creditAmount", width: 50 },
    { label: "Balance", property: "balance", width: 50 },
  ];
  cashPaymentTableJson.datas = [];
  let balanceTotal = 0;
  let debitTotal = 0;
  let creditTotal = 0;
  balanceTotal += customerBalance;
  debitTotal += customerBalance < 0 ? -1 * customerBalance : 0;
  creditTotal += customerBalance > 0 ? customerBalance : 0;

  cashPaymentTableJson.datas.push({
    slno: 1,
    date: "",
    notes: "Opening Balance",
    debitAmount: customerBalance < 0 ? -1 * customerBalance : 0,
    creditAmount: customerBalance > 0 ? customerBalance : 0,
  });
  cashPaymentData.forEach((payment, index) => {
    balanceTotal +=
      payment.paymentType == "1"
        ? -1 * payment.totalAmount
        : payment.totalAmount;

    debitTotal += payment.paymentType == "1" ? payment.totalAmount : 0;
    creditTotal += payment.paymentType == "0" ? payment.totalAmount : 0;

    cashPaymentTableJson.datas.push({
      slno: index + 2,
      date: moment(payment.paymentDate).format("DD/MM/YYYY"),
      notes: payment.paymentNotes,
      debitAmount:
        payment.paymentType == "1"
          ? payment.totalAmount.toLocaleString("en-IN")
          : "",
      creditAmount:
        payment.paymentType == "0"
          ? payment.totalAmount.toLocaleString("en-IN")
          : "",
      balance: parseFloat(balanceTotal).toFixed(2).toLocaleString("en-IN"),
    });
  });
  cashPaymentTableJson.datas.push({
    slno: "bold:Total",
    date: "",
    notes: "",
    debitAmount: parseFloat(debitTotal).toFixed(2).toLocaleString("en-IN"),
    creditAmount: parseFloat(creditTotal).toFixed(2).toLocaleString("en-IN"),
    balance: parseFloat(balanceTotal).toFixed(2).toLocaleString("en-IN"),
  });
  return cashPaymentTableJson;
}

async function createPdf(req, res) {
  // start pdf document
  let doc = new PDFDocument({ margin: 30, size: "A4" });
  // to save on server

  doc.moveDown(8); // separate tables
  doc
    .font("Courier-Bold")
    .fontSize(12)
    .text("Nalanda Associates", { align: "center" });

  doc
    // .font('fonts/PalatinoBold.ttf')
    .fontSize(10)
    .text("Kaipuzha North,", { align: "center" })
    .text("Kulanada (Via),", { align: "center" })
    .text("Pandalam", { align: "center" })
    .text(
      "=========================================================================="
    );

  doc.moveDown(2); // separate tables

  doc
    .font("Times-Roman")
    .fontSize(10)
    .text(req.billNumber, { align: "left", underline: false });

  doc.moveDown(2); // separate tables
  doc
    .font("Courier-Bold")
    .fontSize(10)
    .text("PARTY DETAILS", { align: "left", underline: true });

  doc.moveDown(); // separate tables

  doc
    .font("Times-Roman")
    .fontSize(10)
    .text(req.customerDetails.customerName, { align: "left" })
    .text(req.customerDetails.customerAddress, { align: "left" })
    .text(req.customerDetails.customerPhone, { align: "left" })
    .text(req.customerDetails.customerEmail, { align: "left" });

  doc.moveDown(2); // separate tables

  doc
    .font("Courier-Bold")
    .fontSize(10)
    .text("LATEX COLLECTION STATEMENT", { align: "left", underline: true });

  doc.moveDown(); // separate tables

  doc.table(req.latexTableJson, { width: 300 }); // A4 595.28 x 841.89 (portrait) (about width sizes)

  doc.moveDown(5); // separate tables
  doc
    .font("Courier-Bold")
    .fontSize(10)
    .text("LEDGER STATEMENT", { align: "left", underline: true });
  doc.moveDown(); // separate tables

  doc.table(req.cashPaymentTableJson, { width: 300 }); // A4 595.28 x 841.89 (portrait) (about width sizes)

  doc.moveDown(4); // separate tables

  doc
    .font("Courier-Bold")
    .fontSize(15)
    .text(
      `TOTAL DUE AMOUNT       : ${req.totalDueAmount.toLocaleString("en-IN")}`,
      {
        align: "center",
      }
    );
  doc.moveDown(7); // separate tables

  doc
    .font("Courier-Bold")
    .fontSize(10)
    .text("FOR NALANDA ASSOCIATES", { align: "right" });

  console.log(req.fullFilePath, req.filePath);
  if (!fs.existsSync(req.filePath)) {
    console.log("Making folder");
    fs.mkdirSync(req.filePath);
  }
  doc.pipe(fs.createWriteStream(req.fullFilePath));

  // doc.pipe(res.status(200).json(fullFilePath));

  // done
  doc.end();
}

module.exports = {
  generateInvoiceForCustomer: async function (req, res) {
    let billingDate = req.body.billToDate;
    let generatedInvoices = [];
    let customerObjectWhereClause = req.body.customerId
      ? { customerId: req.body.customerId }
      : {
          customerId: {
            [Op.gte]: 0,
          },
        };
    let customerObject = await db.Customer.findAll({
      where: customerObjectWhereClause,
      include: [
        {
          model: db.CashPayment,
          required: false,
          where: {
            paymentDate: {
              [Op.gte]: moment(req.body.billFromDate).format("MM/DD/YYYY"),
              [Op.lte]: moment(req.body.billToDate).format("MM/DD/YYYY"),
            },
            paymentNotes: {
              [Op.notLike]: "%Bill Generated%",
            },
          },
        },
        {
          model: db.LatexCollection,
          where: {
            collectionDate: {
              [Op.gte]: moment(req.body.billFromDate).format("MM/DD/YYYY"),
              [Op.lte]: moment(req.body.billToDate).format("MM/DD/YYYY"),
            },
          },
        },
      ],
    });
    if (customerObject) {
      console.log(customerObject.length);
      await Promise.all(
        customerObject.map(async (customerObject, index) => {
          // console.log("Iteration" + index + 1);
          // console.log(billingDate);
          let billNumber =
            "Bill: " +
            moment(billingDate).format("DD/MM/YYYY") +
            "-" +
            String(index + 1).padStart(3, "0");
          let customerDetails;
          customerDetails = customerObject.dataValues;
          let latexTableJson = await createLatexTable(
            customerDetails.LatexCollections
          );
          let cashPaymentTableJson = await createCashPaymentTable(
            customerDetails.CashPayments,
            customerDetails.customerBalance
          );
          let totalDueAmount =
            parseFloat(
              latexTableJson.datas[latexTableJson.datas.length - 1].amount
            ) +
            parseFloat(
              cashPaymentTableJson.datas[cashPaymentTableJson.datas.length - 1]
                .balance
            );
          let filePath =
            "./Inv_" + moment(billingDate).format("DDMMYYYY") + "/";
          let fileCustId = customerDetails.customerId.toLocaleString();
          let dateComponent = moment(billingDate).format("DDMMYYYY");
          let fileExtension = ".pdf";
          let fileName = fileCustId.concat("_", dateComponent, fileExtension);
          let fullFilePath = filePath.concat(fileName);
          console.log(filePath, fullFilePath);
          console.log(fileCustId, billNumber);
          // db.Customer.update(
          //   { customerBalance: totalDueAmount },
          //   {
          //     where: { customerId: customerDetails.customerId },
          //   }
          // )
          //   .then((dbModel) => console.log("Customer Due Amount updated"))
          //   .catch((err) => res.status(422).json(err));
          createPdf(
            {
              customerDetails,
              latexTableJson,
              cashPaymentTableJson,
              billingDate,
              totalDueAmount,
              fullFilePath,
              filePath,
              billNumber,
            },
            res
          ).then((res) => generatedInvoices.push(fullFilePath));
        })
      );
    }
    res.set("Access-Control-Allow-Origin", "*"),
      res.status(200).json(generatedInvoices);
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
