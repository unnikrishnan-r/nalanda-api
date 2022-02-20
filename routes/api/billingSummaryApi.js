const router = require("express").Router();
const billingSummaryController = require("../../controllers/billingSummaryController");

// Matches with "/api/projects"
router
  .route("/")
  .post(billingSummaryController.create)
  .get(billingSummaryController.findAll);

router
  .route("/key")
//   .get(billingSummaryController.findSpecificPayment)
  .put(billingSummaryController.updateSpecificBillPeriod);

module.exports = router;
