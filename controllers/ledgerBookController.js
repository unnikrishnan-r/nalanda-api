const db = require("../database/models");

module.exports = {
  findAll: function (req, res) {
    db.LedgerBook.findAll({
      include: [{ model: db.LedgerCustomer, attributes: ["customerName"] }],
      order: [["ledgerEntryDate"]],
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
  getLedgerEntriesPerCustomer: function (req, res) {
    db.LedgerBook.findAll({
      include: [{ model: db.LedgerCustomer, attributes: ["customerName"] }],
      order: [["ledgerEntryDate"]],
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
      db.LedgerBook.create(req.body)
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
  updateSpecificLedgerEntry: function (req, res) {
    db.LedgerBook.update(req.body, {
      where: {
        ledgerEntryDate: req.body.ledgerEntryDate,
        customerId: parseInt(req.body.customerId),
        paymentType:req.body.paymentType
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
