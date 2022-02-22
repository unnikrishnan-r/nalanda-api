const router = require("express").Router();
const invoiceGenerationController = require("../../controllers/invoiceGenerationController");
const latextCollectionController = require("../../controllers/latexCollectionController");

// Matches with "/api/projects"
console.log("invoice generation api");

router.route("/applyRate").put(invoiceGenerationController.applyRate);
router
  .route("/generateInvoiceForCustomer")
  .put(invoiceGenerationController.generateInvoiceForCustomer);

module.exports = router;
