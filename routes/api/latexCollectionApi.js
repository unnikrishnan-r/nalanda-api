const router = require("express").Router();
const latextCollectionController = require("../../controllers/latexCollectionController");

// Matches with "/api/projects"
router
  .route("/")
  .post(latextCollectionController.create)
  .get(latextCollectionController.findAll);

router
  .route("/key")
  .get(latextCollectionController.findSpecificColletion)
  .put(latextCollectionController.updateSpecificColletion);

module.exports = router;
