var printer = require("@thiagoelg/node-printer");
var moment = require("moment");
const fs = require("fs");
const db = require("../database/models");
var Sequelize = require("sequelize");
const Op = Sequelize.Op;
var moment = require("moment");
const aws = require("aws-sdk");
const s3 = new aws.S3();

async function getSingleFile(fileName){
  console.log(`Beginning to get - ${fileName}`)
  const s3GetParams ={
    Bucket: process.env.S3_BUCKET_NAME,
    Key: fileName,  
  }
  const getStatus = await s3.getObject(s3GetParams).promise();
  return getStatus.Body;
}

module.exports = {
  print: function (req, res, next) {
    console.log("Received print req", req.body.billingDate);
    console.log("platform:", process.platform);

    const folderPath =
      "./Inv_" + moment(req.body.billingDate).format("DDMMYYYY") + "/";
    console.log(folderPath);
    fs.readdir(folderPath, (err, files) => {
      files.forEach((fileName) => {
        console.log(fileName);
        printer.printFile({
          filename: folderPath + fileName,
          success: function (jobID) {
            console.log("sent to printer with ID: " + jobID);
          },
          error: function (err) {
            console.log(err);
          },
        });
      });
      res.set("Access-Control-Allow-Origin", "*"),
        res.status(200).json("Success");
    });
  },
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
          .subtract(1,'days').format("DDMMYYYY")
          let derivedFileName = customerBills.dataValues.customerId+"_"+billDate+".pdf"
          fileNames.push(derivedFileName)
        })
      );
      console.log(fileNames)
      const promises = [];
      fileNames.forEach((file) => promises.push(getSingleFile(file)))
      const loopStatus = await Promise.all(promises)
      console.log("Got All Files")
      res.set("Access-Control-Allow-Origin", "*"),
        res.status(200).json(loopStatus);
    }
  },
};
