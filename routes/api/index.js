const router = require("express").Router();
const newCustomerRoute = require("./newCustomerApi");
const latexCollectionRoute = require("./latexCollectionApi");
const cashPaymentRoute = require("./cashPaymentApi");
const billingSummaryRoute = require("./billingSummaryApi");
const invoiceGenerationRoute = require("./invoiceGenerationApi");
const calculateInvoiceAmountRoute = require("./calculateInvoiceAmountApi")
const uploadRoute = require("./uploadApi")

console.log("test");
router.use("/newcustomer", newCustomerRoute);
router.use("/latexCollection", latexCollectionRoute);
router.use("/cashPayment", cashPaymentRoute);
router.use("/billingSummary", billingSummaryRoute);
router.use("/invoiceGeneration", invoiceGenerationRoute);
router.use("/calculateInvoiceAmount", calculateInvoiceAmountRoute)
router.use("/upload", uploadRoute)

module.exports = router;
