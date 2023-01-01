const router = require("express").Router();
const netdueCalcController = require("../../controllers/netdueCalcController");

router
  .route("/")
  .post(netdueCalcController.netdueCalculation)
  .options(netdueCalcController.options);
router
  .route("/new")
  .post(netdueCalcController.netdueCalculationNew)
  .options(netdueCalcController.options);
module.exports = router;
