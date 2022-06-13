const { S3 } = require("aws-sdk");
const uuid = require("uuid").v4;

exports.s3ArrayUploadService = async (files) => {
  const s3 = new S3();

  const params = files.map((file) => {
    return {
      Bucket: process.env.BUCKET_NAME,
      Key: `uploads/${uuid()}-${file.originalname}`,
      Body: file.buffer,
    };
  });

  const result = await Promise.all(
    params.map((param) => s3.upload(param).promise())
  );
  return result;
};

exports.s3FieldsUploadService = async (files) => {
  const avatarFiles = files.avatar || [];
  const resumeFiles = files.resume || [];
  const arrayFiles = [...avatarFiles, ...resumeFiles];
  
  const params = arrayFiles.map((file) => {
    return {
      Bucket: process.env.BUCKET_NAME,
      Key: `uploads/${uuid()}-${file.originalname}`,
      Body: file.buffer,
    };
  });

  const result = await Promise.all(
    params.map((param) => s3.upload(param).promise())
  );
  return result;
}