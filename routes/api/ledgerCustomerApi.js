const router = require("express").Router();
const ledgerCustomerController = require("../../controllers/ledgerCustomerController.js");

// Matches with "/api/projects"
router
  .route("/")
  .post(ledgerCustomerController.create)
  .get(ledgerCustomerController.findAll)
  .options(ledgerCustomerController.options);

router
  .route("/search")
  .get(ledgerCustomerController.searchByName)
  .options(ledgerCustomerController.options);
router
  .route("/:customerId")
  .get(ledgerCustomerController.findByCustId)
  .put(ledgerCustomerController.update)
  .options(ledgerCustomerController.options);

module.exports = router;
