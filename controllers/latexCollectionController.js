const db = require("../database/models");

module.exports = {
  findAll: function (req, res) {
    db.LatexCollection.findAll({
      include: [{ model: db.Customer, attributes: ["customerName"] }],
      order: [["collectionDate", "DESC"]],
    })
      .then((dbModel) => res.json(dbModel))
      // .catch((err) => res.status(422).json(err));
      .catch((err) => {
        console.log(err.parent);
        res.status(400).json(err);
      });
  },
  findSpecificColletion: function (req, res) {
    db.LatexCollection.findOne({
      include: [{ model: db.Customer, attributes: ["customerName"] }],
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
    req.body.tareWeight =
      req.body.tareWeight || parseFloat(process.env.BARREL_WEIGHT);
    req.body.netWeight = parseFloat(
      parseFloat(req.body.grossWeight - req.body.tareWeight).toFixed(2)
    );
    db.LatexCollection.create(req.body)
      .then((dbModel) => res.json(dbModel))
      // .catch((err) => console.log(err));
      .catch((err) => {
        console.log(err.parent);
        res.status(400).json(err);
      });
  },
  updateSpecificColletion: function (req, res) {
    if (req.body.drcPercent > 0 && req.body.netWeight > 0) {
      req.body.dryWeight = (req.body.drcPercent / 100) * req.body.netWeight;
    }
    req.body.tareWeight =
      req.body.tareWeight || parseFloat(process.env.BARREL_WEIGHT);
    req.body.netWeight = parseFloat(
      parseFloat(req.body.grossWeight - req.body.tareWeight).toFixed(2)
    );

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
