const db = require("../database/models");
var Sequelize = require("sequelize");
var moment = require("moment");

const Op = Sequelize.Op;
const path = require("path");
const fs = require("fs");
const PDFDocument = require("pdfkit-table");
const { env } = require("process");
const uploadAPI = require("./uploadController");

async function createLedgerTable(ledgerCustomer, fromDate) {
  let ledgerTableJson = {};
  let openingLinePopulated = false;
  ledgerTableJson.headers = [
    { label: "Date", property: "date", width: 50 },
    { label: "Particulars", property: "notes", width: 200 },
    { label: "Debit", property: "debitAmount", width: 50 },
    { label: "Credit", property: "creditAmount", width: 50 },
    { label: "Balance", property: "balance", width: 50 },
  ];
  ledgerTableJson.datas = [];
  let balanceTotal = 0;

  ledgerCustomer.LedgerBooks.forEach((entry, index) => {
    if (index === 0) {
      balanceTotal = 0;
    }
    ledgerEntry = entry.dataValues;

    let openDate = moment(fromDate).format("YYYY-MM-DD");
    let lineDate = moment(ledgerEntry.ledgerEntryDate).format("YYYY-MM-DD");

    console.log(openDate, lineDate);
    const isBefore = moment(lineDate).isBefore(openDate);
    console.log(isBefore);

    if (!isBefore) {
      if (!openingLinePopulated) {
        openingLinePopulated = true;
        ledgerTableJson.datas.push({
          date: moment(fromDate).format("DD/MM/YYYY"),
          notes: "Opening Balance",
          debitAmount: 0,
          creditAmount: 0,
          balance: parseFloat(balanceTotal).toFixed(2).toLocaleString("en-IN"),
        });
      }
      balanceTotal +=
        ledgerEntry.paymentType == "0"
          ? -1 * ledgerEntry.totalAmount
          : ledgerEntry.totalAmount;

      ledgerTableJson.datas.push({
        date: moment(ledgerEntry.ledgerEntryDate).format("DD/MM/YYYY"),
        notes: ledgerEntry.paymentNotes,
        debitAmount:
          ledgerEntry.paymentType == "0"
            ? parseFloat(ledgerEntry.totalAmount)
                .toFixed(2)
                .toLocaleString("en-IN")
            : "",
        creditAmount:
          ledgerEntry.paymentType == "1"
            ? parseFloat(ledgerEntry.totalAmount)
                .toFixed(2)
                .toLocaleString("en-IN")
            : "",
        balance: parseFloat(balanceTotal).toFixed(2).toLocaleString("en-IN"),
      });
    } else {
      balanceTotal +=
        ledgerEntry.paymentType == "0"
          ? -1 * ledgerEntry.totalAmount
          : ledgerEntry.totalAmount;
    }
  });

  return ledgerTableJson;
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
    .text(moment().format("DD/MM/YYYY"), { align: "left", underline: true });
  doc.moveDown(); // separate tables

  doc.table(req.ledgerTableJson, { width: 300 }); // A4 595.28 x 841.89 (portrait) (about width sizes)

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
  generateLedgerStatementForCustomer: async function (req, res) {
    let fullFilePath;
    let customerId = req.body.customerId;
    let fromDate = req.body.ledgerFromEntryDate;

    let ledgerObject = await db.LedgerCustomer.findAll({
      where: {
        customerId: customerId,
      },
      include: [{ model: db.LedgerBook }],
    });

    if (ledgerObject) {
      let customerDetails = {
        customerName: ledgerObject[0].dataValues.customerName,
        customerAddress: ledgerObject[0].dataValues.customerAddress,
        customerPhone: ledgerObject[0].dataValues.customerPhone,
        customerEmail: ledgerObject[0].dataValues.customerEmail,
      };
      let ledgerTableJson = await createLedgerTable(
        ledgerObject[0].dataValues,
        fromDate
      );
      let totalDueAmount =
        ledgerTableJson.datas[ledgerTableJson.datas.length - 1].balance;
      let filePath = "./Ledger_" + moment().format("DDMMYYYY") + "/";
      let fileCustId = customerId.toLocaleString();
      let dateComponent = moment().format("DDMMYYYY");
      let fileExtension = ".pdf";
      let fileName = fileCustId.concat("_", dateComponent, fileExtension);
      fullFilePath = filePath.concat(fileName);

      createPdf({
        customerDetails,
        ledgerTableJson,
        totalDueAmount,
        fullFilePath,
        filePath,
      }).then((res) => console.log(fullFilePath));
    }
    res.set("Access-Control-Allow-Origin", "*"),
      res.status(200).json(fullFilePath);
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
