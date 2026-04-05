const router = require("express").Router();
const printController = require("../../controllers/printController");

router
.route("/download")
.post(printController.download)

module.exports = router;
