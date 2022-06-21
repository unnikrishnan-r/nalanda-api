var printer = require("@thiagoelg/node-printer");
var moment = require("moment");
const fs = require("fs");

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
};
