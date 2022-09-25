const router = require("express").Router();
const netdueCalcController = require("../../controllers/netdueCalcController");

router
  .route("/")
  .post(netdueCalcController.netdueCalculation)
  .options(netdueCalcController.options);
module.exports = router;