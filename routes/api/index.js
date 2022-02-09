const router = require("express").Router();
const newCustomerRoute = require("./newCustomerApi");
const latexCollectionRoute = require("./latexCollectionApi");



console.log("test")
router.use("/newcustomer", newCustomerRoute);
router.use("/latexCollection", latexCollectionRoute);


module.exports = router;
