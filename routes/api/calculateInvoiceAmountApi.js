const router = require("express").Router();
const calculateInvoiceAmountController = require("../../controllers/calculateInvoiceAmountController");
router
  .route("/")
  .post(calculateInvoiceAmountController.calculateInvoiceAmount)
  .options(calculateInvoiceAmountController.options);
module.exports = router;
