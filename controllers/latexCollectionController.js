const db = require("../database/models");

module.exports = {
  findAll: function (req, res) {
    db.LatexCollection.findAll({
      include: [{ model: db.Customer, attributes: ["customerName"] }],
      order: [["collectionDate", "DESC"]],
    })
      .then(
        (dbModel) => (
          res.set("Access-Control-Allow-Origin", "*"), res.json(dbModel)
        )
      )
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
      .then(
        (dbModel) => (
          res.set("Access-Control-Allow-Origin", "*"), res.json(dbModel)
        )
      )
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
      .then(
        (dbModel) => (
          res.set({
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers":
              "Origin, X-Requested-With, Content-Type, Accept",
            "Content-Type": "application/json",
          }),
          res.json(dbModel)
        )
      )
      // .catch((err) => console.log(err));
      .catch((err) => {
        console.log(err.parent);
        res.status(400).json(err);
      });
  },
  updateSpecificColletion: function (req, res) {
    req.body.tareWeight =
      req.body.tareWeight || parseFloat(process.env.BARREL_WEIGHT);

    req.body.netWeight = parseFloat(
      parseFloat(req.body.grossWeight - req.body.tareWeight).toFixed(2)
    );

    req.body.dryWeight = (req.body.drcPercent / 100) * req.body.netWeight;

    req.body.totalAmount =
      req.body.unitRatePerKg *
      (Math.round((req.body.dryWeight + Number.EPSILON) * 100) / 100);

    db.LatexCollection.update(req.body, {
      where: {
        seqNumber: parseInt(req.body.seqNumber),
        customerId: parseInt(req.body.customerId),
      },
    })
      .then(
        (dbModel) => (
          res.set({
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers":
              "Origin, X-Requested-With, Content-Type, Accept",
            "Content-Type": "application/json",
          }),
          res.json(dbModel)
        )
      )
      .catch((err) => res.status(422).json(err));
  },
  options: function (req, res) {
    res.set({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "*",
      "Access-Control-Allow-Headers":
        "Origin, X-Requested-With, Content-Type, Accept",
      "Content-Type": "application/json",
    }),
      res.json();
  },
};
