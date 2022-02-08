const router = require("express").Router();
const newCustomerRoute = require("./newCustomerApi");


console.log("test")
router.use("/newcustomer", newCustomerRoute);

module.exports = router;
