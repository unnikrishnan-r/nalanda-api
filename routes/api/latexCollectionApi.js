const router = require("express").Router();
const latextCollectionController = require("../../controllers/latexCollectionController");

// Matches with "/api/projects"

router
  .route("/")
  .post(latextCollectionController.create)
  .get(latextCollectionController.findAll)
  .options(latextCollectionController.options)


router
  .route("/key")
  .get(latextCollectionController.getLatexEntriesPerCustomer)
  .put(latextCollectionController.updateSpecificColletion)
  .options(latextCollectionController.options)

module.exports = router;
