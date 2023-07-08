const { initializeApp } = require("@firebase/app");
const {
   getStorage,
   ref,
   uploadBytesResumable,
   getDownloadURL,
} = require("@firebase/storage");
const uuid = require("uuid").v4;

let storage;

if (process.env.FILE_UPLOAD_LOCATION === "FIREBASE") {
   const firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG);
   initializeApp(firebaseConfig);
   storage = getStorage();
}

async function uploadToFirebaseAndGetUrl(imgData) {
   const imgName = `${uuid()}--${imgData?.originalname}`;
   const imgRef = ref(storage, `images/${imgName}`);
   const snapshot = await uploadBytesResumable(imgRef, imgData?.buffer, {
      contentType: imgData?.mimetype,
   });
   //delete the uploaded image if was not able to get download url
   return getDownloadURL(snapshot.ref);
}

module.exports = async (req, res, next) => {
   if (process.env.FILE_UPLOAD_LOCATION === "FIREBASE") {
      try {
         req.blogImage = await uploadToFirebaseAndGetUrl(req.file);
         next();
      } catch (err) {
         console.error(err);
         next(err);
      }
   } else next();
};
