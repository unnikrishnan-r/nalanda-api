const router = require("express").Router();
const uploadController = require("../../controllers/uploadController");

// Matches with "/api/projects"
router
  .route("/")
  .post(uploadController.upload)
  .options(uploadController.options);
  router
  .route("/ledger")
  .post(uploadController.uploadledger)
  .options(uploadController.options);
module.exports = router;
