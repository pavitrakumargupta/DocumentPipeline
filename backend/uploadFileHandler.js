const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const dotenv = require('dotenv');
const { S3 } = require('aws-sdk') ;


dotenv.config();

const AWS_ACCESS_KEY_ID=process.env.AWS_ACCESS_KEY_ID
const AWS_SECRET_ACCESS_KEY=process.env.AWS_SECRET_ACCESS_KEY


const s3 = new S3({
  region: "eu-north-1",
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

module.exports.Uploadhandler=async(req, res)=> {
  
      const {  filename, ContentType } = req.body;
      
      if (!filename || !ContentType) {
        return res.status(400).json({ error: 'Missing filename or ContentType' });
      }
    
      try {
        const params = {
            Bucket: 'ocr--pipeline',
            Key: filename,
            Expires: 60,
            ContentType: ContentType
          };
    
    
        const signedUrl = await s3.getSignedUrlPromise('putObject', params);
        res.status(200).json({ signedUrl });
       
    } catch (error) {
      console.error('Error generating signed URL:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
    
  
}

// export default Uploadhandler;
