
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: 'eu-north-1',
  credentials: {
    accessKeyId:import.meta.env.VITE_ACESS_KEY,
    secretAccessKey: import.meta.env.VITE_SECRET_KEY,
  },
});



export const uploadToS3 = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer(); // ⬅️ Convert File to ArrayBuffer
    console.log(file);
    const uid = `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const params :any = {
        Bucket: 'ocr--pipeline',
        Key: uid,
        Body: arrayBuffer,
        ContentType: file.type,
    };
    console.log(params);

  const command = new PutObjectCommand(params);
  try {
   await s3.send(command);
    return `https://ocr--pipeline.s3.eu-north-1.amazonaws.com/${uid}`;
  } catch (err) {
    console.error("Upload error:", err);
    throw err;
  }
};