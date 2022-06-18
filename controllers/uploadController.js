const aws = require("aws-sdk");
const s3 = new aws.S3();
const fs = require("fs");

module.exports = {
  upload: function(req, res, next) {
    console.log(req.body)
    console.log(req.body.file)
    let uploadFile = req.body.file;
    fs.readFile(uploadFile, (err, uploadedData) => {
      console.log("read file")
      if (err) {
        throw err;
      }
      let body= fs.createReadStream(uploadFile);

      const s3PutParams = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: uploadFile,
        Body: body,
        ACL: "public-read"
      };

      const s3GetParams = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: uploadFile
      };

      s3.putObject(s3PutParams, function(err, response) {
        if (err) {
          console.error(err);
        } else {
          var url = s3.getSignedUrl("getObject", s3GetParams);
          res.json({
            publicUrl: `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/${uploadFile}`
          });
        }
      });
    });
  }
};
