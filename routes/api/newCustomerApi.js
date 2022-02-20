const router = require("express").Router();
const newCustomerConstroller = require("../../controllers/newCustomerController");

// Matches with "/api/projects"
router
  .route("/")
  .post(newCustomerConstroller.create)
  .get(newCustomerConstroller.findAll);

router
  .route("/:customerId")
  .get(newCustomerConstroller.findByCustId)
  .put(newCustomerConstroller.update)

module.exports = router;
