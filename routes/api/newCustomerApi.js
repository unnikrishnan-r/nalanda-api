const router = require("express").Router();
const newCustomerConstroller = require("../../controllers/newCustomerController");

// Matches with "/api/projects"
router
  .route("/")
  .post(newCustomerConstroller.create)
  .get(newCustomerConstroller.findAll)
  .options(newCustomerConstroller.options)

router
  .route("/:customerId")
  .get(newCustomerConstroller.findByCustId)
  .put(newCustomerConstroller.update)
  .options(newCustomerConstroller.options)

module.exports = router;
