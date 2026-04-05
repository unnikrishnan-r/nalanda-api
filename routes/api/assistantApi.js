const router = require("express").Router();
const assistantController = require("../../controllers/assistantController");

router
  .route("/")
  .post(assistantController.handleMessage)
  .options(assistantController.options);

module.exports = router;
