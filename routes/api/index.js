const router = require("express").Router();
const newCustomerRoute = require("./newCustomerApi");
const latexCollectionRoute = require("./latexCollectionApi");
const cashPaymentRoute = require("./cashPaymentApi");
const billingSummaryRoute = require("./billingSummaryApi");
const invoiceGenerationRoute = require("./invoiceGenerationApi");
const calculateInvoiceAmountRoute = require("./calculateInvoiceAmountApi")
const applyRateRoute = require("./applyRateApi")
const uploadRoute = require("./uploadApi")
const printRoute = require("./printApi")
const userRoute = require("./userApi");
const loginRoute = require("./loginApi");


console.log("test");
router.use("/newcustomer", newCustomerRoute);
router.use("/latexCollection", latexCollectionRoute);
router.use("/cashPayment", cashPaymentRoute);
router.use("/billingSummary", billingSummaryRoute);
router.use("/invoiceGeneration", invoiceGenerationRoute);
router.use("/calculateInvoiceAmount", calculateInvoiceAmountRoute)
router.use("/applyRate", applyRateRoute)
router.use("/upload", uploadRoute)
router.use("/print", printRoute)
router.use("/user", userRoute);
router.use("/login", loginRoute);

module.exports = router;
