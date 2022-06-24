const router = require("express").Router();
const cashPaymentController = require("../../controllers/cashPaymentController");

// Matches with "/api/projects"
router
  .route("/")
  .post(cashPaymentController.create)
  .get(cashPaymentController.findAll)
  .options(cashPaymentController.options);

router
  .route("/key")
  .get(cashPaymentController.getCashPaymentsPerCustomer)
  .put(cashPaymentController.updateSpecificPayment)
  .options(cashPaymentController.options);

module.exports = router;
