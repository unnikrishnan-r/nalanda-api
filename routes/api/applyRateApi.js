const router = require("express").Router();
const applyRateController = require("../../controllers/applyRateController");
router
  .route("/")
  .post(applyRateController.applyRate)
  .options(applyRateController.options);
module.exports = router;
