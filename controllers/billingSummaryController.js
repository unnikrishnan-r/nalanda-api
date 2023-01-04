const db = require("../database/models");

module.exports = {
  findAll: function (req, res) {
    db.BillingSummary.findAll({
      order: [["seqNumber", "DESC"]],
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
      .catch((err) => {
        console.log(err.parent);
        res.status(400).json(err);
      });
  },
  create: function (req, res) {
    db.BillingSummary.create(req.body)
      .then((dbModel) => res.json(dbModel))
      // .catch((err) => console.log(err));
      .catch((err) => {
        console.log(err.parent);
        res.status(400).json(err);
      });
  },
  updateSpecificBillPeriod: function (req, res) {
    db.BillingSummary.update(req.body, {
      where: {
        billPeriod: parseInt(req.body.billPeriod),
      },
    })
      .then((dbModel) => res.json(dbModel))
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
