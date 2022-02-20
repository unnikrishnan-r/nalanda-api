const router = require("express").Router();
const newCustomerRoute = require("./newCustomerApi");
const latexCollectionRoute = require("./latexCollectionApi");
const cashPaymentRoute = require("./cashPaymentApi");
const billingSummaryRoute = require("./billingSummaryApi");
const invoiceGenerationRoute = require("./invoiceGenerationApi");

console.log("test");
router.use("/newcustomer", newCustomerRoute);
router.use("/latexCollection", latexCollectionRoute);
router.use("/cashPayment", cashPaymentRoute);
router.use("/billingSummary", billingSummaryRoute);
router.use("/invoiceGeneration", invoiceGenerationRoute);

module.exports = router;
