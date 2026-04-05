var moment = require("moment");
const db = require("../database/models");
var Sequelize = require("sequelize");
const Op = Sequelize.Op;

module.exports = {
  download: async function (req, res, next) {
    console.log(req.body);
    let customerBills = await db.CashPayment.findAll({
      where: {
        customerId: req.body.customerId,
        paymentType: 0,
        paymentNotes: {
          [Op.like]: "%Bill Gene%",
        },
      },
    });
    if (customerBills) {
      let fileNames = [];
      await Promise.all(
        customerBills.map(async (customerBills, index) => {
          let billDate = moment(customerBills.dataValues.paymentDate)
            .subtract(2, "days")
            .format("DDMMYYYY");

          let derivedFileName =
            "https://" +
            process.env.S3_BUCKET_NAME +
            "." +
            process.env.S3_REGION_NAME +
            "/" +
            customerBills.dataValues.customerId +
            "_" +
            billDate +
            ".pdf";
            console.log(derivedFileName)
          fileNames.push(derivedFileName);
        })
      );
      console.log(fileNames);
      res.set("Access-Control-Allow-Origin", "*"),
        res.status(200).json(fileNames);
    }
  },
};
