const db = require("../database/models");
var Sequelize = require("sequelize");
const Op = Sequelize.Op;

module.exports = {
  applyRate: function (req, res) {
    db.BillingSummary.findOne({
      where: {
        billPeriod: req.body.billPeriod,
      },
    })
      // .then((dbModel) => res.json(dbModel))
      .then((dbModel) => {
        req.body.billFromDate = dbModel.dataValues.billFromDate;
        req.body.billToDate = dbModel.dataValues.billToDate;
        req.body.unitRatePerKg = dbModel.dataValues.unitRatePerKg;
        console.log(req.body);
        db.LatexCollection.update(req.body, {
          where: {
            collectionDate: {
              [Op.gte]: req.body.billFromDate,
              [Op.lte]: req.body.billToDate,
            },
          },
        })
          .then((dbModel) => res.json(dbModel))
          .catch((err) => {
            console.log(err);
            res.status(400).json(err);
          });
      })

      // .catch((err) => res.status(422).json(err));
      .catch((err) => {
        console.log(err);
        res.status(400).json(err);
      });
  },
};
