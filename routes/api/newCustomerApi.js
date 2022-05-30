const router = require("express").Router();
const newCustomerController = require("../../controllers/newCustomerController");

// Matches with "/api/projects"
router
  .route("/")
  .post(newCustomerController.create)
  .get(newCustomerController.findAll)
  .options(newCustomerController.options)

router
  .route("/:customerId")
  .get(newCustomerController.findByCustId)
  .put(newCustomerController.update)
  .options(newCustomerController.options)

module.exports = router;
