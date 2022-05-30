const db = require("../database/models");

module.exports = {
  findAll: function (req, res) {
    db.Customer.findAll({ order: [["customerName", "ASC"]] })
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
  findByCustId: function (req, res) {
    console.log(req.params);
    db.Customer.findOne({
      where: { customerId: parseInt(req.params.customerId) },
    })
      .then(
        (dbModel) => (
          res.set("Access-Control-Allow-Origin", "*"), res.json(dbModel)
        )
      )
      .catch((err) => res.status(422).json(err));
  },
  create: function (req, res) {
    console.log(req.body);
    db.Customer.create(req.body)
      .then(
        (dbModel) => (
          res.set({
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
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
  update: function (req, res) {
    console.log("Received Update request");
    console.log(req.body);
    console.log(req.params);
    db.Customer.update(req.body, {
      where: { customerId: req.params.customerId },
    })
      .then(
        (dbModel) => (
          res.set({
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
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
      "Access-Control-Allow-Headers": "*",
      "Content-Type": "application/json",
    }),
      res.json();
  },
};
