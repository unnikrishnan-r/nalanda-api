const router = require("express").Router();
const cashPaymentController = require("../../controllers/cashPaymentController");

// Matches with "/api/projects"
router
  .route("/")
  .post(cashPaymentController.create)
  .get(cashPaymentController.findAll);

router
  .route("/key")
  .get(cashPaymentController.findSpecificPayment)
  .put(cashPaymentController.updateSpecificPayment);

module.exports = router;
