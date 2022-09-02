const db = require("../database/models");

module.exports = {
  findAll: function (req, res) {
    db.Employee.findAll({})
      .then((dbModel) => res.json(dbModel))
      .catch((err) => res.status(422).json(err));
  },
  findById: function (req, res) {
    db.Employee.findOne({ where: { id: req.params.id } })
      .then((dbModel) =>
        res.json({ id: dbModel.id, username: dbModel.username })
      )
      .catch((err) => res.status(422).json(err));
  },
  create: function (req, res) {
    console.log(req.body);
    db.Employee.create(req.body)
      .then((dbModel) =>
        res.json({ id: dbModel.id, username: dbModel.username })
      )
      .catch((err) => {
        console.log(err.parent);
        res.status(400).json(err.parent.errno);
      });
  },
  update: function (req, res) {
    db.Employee.update(req.body, { where: { id: req.params.id } })
      .then((dbModel) =>
        res.json({ id: dbModel.id, username: dbModel.username })
      )
      .catch((err) => res.status(422).json(err));
  },
  remove: function (req, res) {
    db.Employee.destroy({ id: req.params.id }).catch((err) =>
      res.status(422).json(err)
    );
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
