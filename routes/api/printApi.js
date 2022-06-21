const router = require("express").Router();
const printController = require("../../controllers/printController");

// Matches with "/api/projects"
router
  .route("/")
  .post(printController.print)

module.exports = router;
