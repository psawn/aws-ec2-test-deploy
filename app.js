require("dotenv").config();
const express = require("express");
const multer = require("multer");
const uuid = require("uuid").v4;
const { s3ArrayUploadService, s3FieldsUploadService } = require("./s3Service");

const app = express();
const port = 3000;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    const { originalname } = file;
    cb(null, `${uuid()}-${originalname}`);
  },
});
const s3Storge = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.split("/")[0] === "image") {
    cb(null, true);
  } else {
    // C1: sẽ tiếp tục upload đến khi có lỗi
    // req.fileValidationError = "goes wrong on the mimetype";
    // return cb(null, false, new Error("goes wrong on the mimetype"));

    // C2: 1 file lỗi là dừng luôn
    return cb(new Error("goes wrong on the mimetype"), false);
  }
};

const limits = {
  fileSize: 10000000,
};

const upload = multer({ storage, fileFilter, limits });
const s3Upload = multer({ s3Storge, fileFilter, limits });

const multiUpload = upload.fields([
  { name: "avatar", maxCount: 1 },
  { name: "resume", maxCount: 1 },
]);
const s3FieldsUpload = s3Upload.fields([
  { name: "avatar", maxCount: 1 },
  { name: "resume", maxCount: 1 },
]);
const s3ArrayUpload = s3Upload.array("file");

app.get("/", (req, res) => {
  res.send("Hello World from Express! lorem ipsum dolor sit amet");
});

app.post("/upload", async (req, res) => {
  multiUpload(req, res, (error) => {
    // C1:
    // if (req.fileValidationError) {
    //   return res.status(400).json({ result: req.fileValidationError });
    // }

    // C2:
    if (error) return res.status(400).json({ result: error.message });
    res.json({ message: "success" });
  });
});

app.post("/s3-upload", async (req, res) => {
  // s3FieldsUpload(req, res, async (error) => {
  //   if (error) {
  //     return res.status(400).json({ error: error.message });
  //   } else {
  //     result = await s3FieldsUploadService(req.files);
  //   }
  //   res.json({ message: "success", result });
  // });
  s3ArrayUpload(req, res, async (error) => {
    if (error) {
      return res.status(400).json({ error: error.message });
    } else {
      result = await s3ArrayUploadService(req.files);
    }
    res.json({ message: "success", result });
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

// reference: https://github.com/Sanjeev-Thiyagarajan/nodejs-upload-files/blob/main/index.js
