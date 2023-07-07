const path = require("path");
const multer = require("multer");
const uuid = require("uuid").v4;
const multerS3 = require("multer-s3");
const { S3 } = require("@aws-sdk/client-s3");

let s3, s3Storage;

if (!process.env.LOCAL_FILE_SYSTEM) {
   s3 = new S3({
      credentials: {
         accessKeyId: process.env.AWS_ACCESS_KEY_ID,
         secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
         sessionToken: process.env.AWS_SESSION_TOKEN,
      },
      region: process.env.AWS_REGION,
   });
   s3Storage = multerS3({
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
}

const fileSystemStorage = multer.diskStorage({
   destination: (req, file, cb) => {
      cb(null, path.join(__dirname, "..", "public", "images"));
   },
   filename: (req, file, cb) => {
      const newName = `${uuid()}--${file.originalname}`;
      cb(null, newName);
      req.blogImage = newName;
   },
});

const storage = process.env.LOCAL_FILE_SYSTEM ? fileSystemStorage : s3Storage;

const upload = multer({ storage });
module.exports = upload;
