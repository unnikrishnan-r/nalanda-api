const router = require("express").Router();
const ledgerStatementGenerationController = require("../../controllers/ledgerStatementGenerationController");

// Matches with "/api/projects"
console.log("latex generation api");

router
  .route("/generateLedgerStatementForCustomer")
  .put(ledgerStatementGenerationController.generateLedgerStatementForCustomer)
  .options(ledgerStatementGenerationController.options);

module.exports = router;
