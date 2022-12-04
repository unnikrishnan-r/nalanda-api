const db = require("../database/models");

module.exports = {
  findAll: function (req, res) {
    db.CashPayment.findAll({
      include: [{ model: db.Customer, attributes: ["customerName"] }],
      order: [["paymentDate", "DESC"]],
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
      // .catch((err) => res.status(422).json(err));
      .catch((err) => {
        console.log(err.parent);
        res.status(400).json(err);
      });
  },
  getCashPaymentsPerCustomer: function (req, res) {
    db.CashPayment.findAll({
      include: [{ model: db.Customer, attributes: ["customerName"] }],
      where: {
        customerId: parseInt(req.query.customerId),
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
      // .catch((err) => res.status(422).json(err));
      .catch((err) => {
        console.log(err.parent);
        res.status(400).json(err);
      });
  },

  create: async function (req, res) {
    return (
      db.CashPayment.create(req.body)
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
        })
    );
  },
  updateSpecificPayment: function (req, res) {
    db.CashPayment.update(req.body, {
      where: {
        paymentDate: req.body.paymentDate,
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
