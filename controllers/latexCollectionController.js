const db = require("../database/models");

module.exports = {
  findAll: function (req, res) {
    db.LatexCollection.findAll({ order: [["collectionDate", "DESC"]] })
      .then((dbModel) => res.json(dbModel))
      // .catch((err) => res.status(422).json(err));
      .catch((err) => {
        console.log(err.parent);
        res.status(400).json(err);
      });
  },
  findSpecificColletion: function (req, res) {
    db.LatexCollection.findOne({
      where: {
        seqNumber: parseInt(req.query.seqNumber),
        customerId: parseInt(req.query.customerId),
      },
    })
      .then((dbModel) => res.json(dbModel))
      // .catch((err) => res.status(422).json(err));
      .catch((err) => {
        console.log(err.parent);
        res.status(400).json(err);
      });
  },
  create: function (req, res) {
    db.LatexCollection.create(req.body)
      .then((dbModel) => res.json(dbModel))
      // .catch((err) => console.log(err));
      .catch((err) => {
        console.log(err.parent);
        res.status(400).json(err);
      });
  },
  updateSpecificColletion: function (req, res) {
    console.log(req.body);

    db.LatexCollection.update(req.body, {
      where: {
        seqNumber: parseInt(req.body.seqNumber),
        customerId: parseInt(req.body.customerId),
      },
    })
      .then((dbModel) => res.json(dbModel))
      .catch((err) => res.status(422).json(err));
  },
};
