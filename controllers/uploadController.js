const aws = require("aws-sdk");
const s3 = new aws.S3();
const fs = require("fs");

module.exports = {
  upload: async function (req, res, next) {
    console.log("Inside upload controller");
    let uploadFile = req.body.file;
    fs.readFile(uploadFile, (err, uploadedData) => {
      console.log("read file");
      if (err) {
        throw err;
      }
      let body = fs.createReadStream(uploadFile);

      const s3PutParams = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: uploadFile.substr(15),
        Body: body,
        ACL: "public-read",
      };

      const s3GetParams = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: uploadFile.substr(15),
      };

      s3.putObject(s3PutParams, function (err, response) {
        if (err) {
          console.error(err);
        } else {
          var url = s3.getSignedUrl("getObject", s3GetParams);
          res.set("Access-Control-Allow-Origin", "*"),
            res.status(200).json({
              publicUrl: `https://${
                process.env.S3_BUCKET_NAME
              }.s3.amazonaws.com/${uploadFile.substr(15)}`,
            });
        }
      });
    });
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
