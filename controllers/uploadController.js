const aws = require("aws-sdk");
const s3 = new aws.S3();
const fs = require("fs");

async function uploadSingleFile(fileName) {
  console.log(`Beginning to upload - ${fileName.substr(15)}`);
  const s3PutParams = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: fileName.substr(15),
    Body: fs.createReadStream(fileName),
    ACL: "public-read",
  };
  const uploadStatus = await s3.upload(s3PutParams).promise();
  console.log(`File uploaded successfully. ${uploadStatus.Location}`);
  return uploadStatus.Location;
}

module.exports = {
  upload: async function (req, res) {
    console.log("Inside upload controller");
    const promises = [];
    req.body.files.forEach((file) => promises.push(uploadSingleFile(file)));
    const loopStatus = await Promise.all(promises);
    console.log("All Uploads Done");
    console.log(loopStatus);
    res.set("Access-Control-Allow-Origin", "*"),
      res.status(200).json(loopStatus);
  },
  uploadledger: async function (req, res) {
    console.log("Inside upload Ledger controller");
    let uploadLocation = await uploadSingleFile(req.body.file);
    console.log("All Uploads Done");
    // console.log(loopStatus);
    res.set("Access-Control-Allow-Origin", "*"),
    res.status(200).json(uploadLocation);
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
