const path = require("path");
const multer = require("multer");
const uuid = require("uuid").v4;
const multerS3 = require("multer-s3");
const { S3 } = require("@aws-sdk/client-s3");

let s3, storage;

if (process.env.FILE_UPLOAD_LOCATION === "AWS") {
   s3 = new S3({
      credentials: {
         accessKeyId: process.env.AWS_ACCESS_KEY_ID,
         secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
         sessionToken: process.env.AWS_SESSION_TOKEN,
      },
      region: process.env.AWS_REGION,
   });
   storage = multerS3({
      s3: s3,
      bucket: process.env.CYCLIC_BUCKET_NAME,
      metadata: (req, file, cb) => {
         cb(null, { fieldname: file.fieldname });
      },
      key: (req, file, cb) => {
         const fileName = `${uuid()}--${file.originalname}`;
         cb(null, fileName);
      },
   });
} else if (process.env.FILE_UPLOAD_LOCATION === "FS") {
   storage = multer.diskStorage({
      destination: (req, file, cb) => {
         cb(null, path.join(__dirname, "..", "public", "images"));
      },
      filename: (req, file, cb) => {
         const newName = `${uuid()}--${file.originalname}`;
         req.blogImage = `/images/${newName}`;
         cb(null, newName);
      },
   });
} else if (process.env.FILE_UPLOAD_LOCATION === "FIREBASE") {
   storage = multer.memoryStorage();
}

const upload = multer({ storage });
module.exports = upload;
