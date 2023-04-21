const router = require("express").Router();
const ledgerBookController = require("../../controllers/ledgerBookController");

// Matches with "/api/projects"
router
  .route("/")
  .post(ledgerBookController.create)
  .get(ledgerBookController.findAll)
  .options(ledgerBookController.options);

router
  .route("/key")
  .get(ledgerBookController.getLedgerEntriesPerCustomer)
  .put(ledgerBookController.updateSpecificLedgerEntry)
  .options(ledgerBookController.options);

module.exports = router;
