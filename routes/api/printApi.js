const router = require("express").Router();
const printController = require("../../controllers/printController");

// Matches with "/api/projects"
router
  .route("/")
  .post(printController.print)

router
.route("/download")
.post(printController.download)

module.exports = router;
