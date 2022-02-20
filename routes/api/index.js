const router = require("express").Router();
const newCustomerRoute = require("./newCustomerApi");
const latexCollectionRoute = require("./latexCollectionApi");
const cashPaymentRoute = require("./cashPaymentApi");



console.log("test")
router.use("/newcustomer", newCustomerRoute);
router.use("/latexCollection", latexCollectionRoute);
router.use("/cashPayment", cashPaymentRoute);


module.exports = router;
