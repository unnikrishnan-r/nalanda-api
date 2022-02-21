const db = require("../database/models");
var Sequelize = require("sequelize");
const Op = Sequelize.Op;

async function findUnitRate(billPeriod) {
  return db.BillingSummary.findOne({
    where: {
      billPeriod: billPeriod,
    },
  });
}

async function updateLatexEntries(billFromDate, billToDate, unitRatePerKg) {
  return db.LatexCollection.update(
    { unitRatePerKg },
    {
      where: {
        collectionDate: { [Op.gte]: billFromDate, [Op.lte]: billToDate },
      },
    }
  );
}

async function updateTotalAmountForLatexEntry(
  seqNumber,
  customerId,
  dryWeight,
  unitRatePerKg
) {
  var totalAmount = dryWeight * unitRatePerKg;
  return db.LatexCollection.update(
    { totalAmount },
    {
      where: {
        seqNumber: seqNumber,
        customerId: customerId,
      },
    }
  );
}

module.exports = {
  applyRate: async function (req, res) {
    let billingObject = await findUnitRate(req.body.billPeriod);
    let latexObject = await updateLatexEntries(
      billingObject.dataValues.billFromDate,
      billingObject.dataValues.billToDate,
      billingObject.dataValues.unitRatePerKg
    );
    let latexEntries = await db.LatexCollection.findAll({
      where: {
        collectionDate: {
          [Op.gte]: billingObject.dataValues.billFromDate,
          [Op.lte]: billingObject.dataValues.billToDate,
        },
      },
    });
    for (var i = 0; i < latexEntries.length; i++) {
      let result = await updateTotalAmountForLatexEntry(
        latexEntries[i].dataValues.seqNumber,
        latexEntries[i].dataValues.customerId,
        latexEntries[i].dataValues.dryWeight,
        latexEntries[i].dataValues.unitRatePerKg
      );
    }
    if (i == latexEntries.length) {
      res.json("Success");
    } else {
      res.status(422);
    }
  },
};
