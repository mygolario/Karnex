import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const LIARA_ENDPOINT = process.env.LIARA_ENDPOINT || "https://storage.iran.liara.space";
const LIARA_BUCKET_NAME = process.env.LIARA_BUCKET_NAME || "";
const LIARA_ACCESS_KEY = process.env.LIARA_ACCESS_KEY || "";
const LIARA_SECRET_KEY = process.env.LIARA_SECRET_KEY || "";

if (!LIARA_ACCESS_KEY || !LIARA_SECRET_KEY || !LIARA_BUCKET_NAME) {
  console.warn("⚠️ Liara S3 credentials are missing. File uploads will fail.");
}

export const s3Client = new S3Client({
  region: "default",
  endpoint: LIARA_ENDPOINT,
  credentials: {
    accessKeyId: LIARA_ACCESS_KEY,
    secretAccessKey: LIARA_SECRET_KEY,
  },
});

export async function uploadFileToS3(
    file: File | Buffer,
    fileName: string,
    contentType: string,
    folder: string = "uploads"
) {
  const key = `${folder}/${Date.now()}-${fileName}`;
  
  // Convert File to Buffer if necessary
  let body = file;
  if (file instanceof File) {
    const arrayBuffer = await file.arrayBuffer();
    body = Buffer.from(arrayBuffer);
  }

  const command = new PutObjectCommand({
    Bucket: LIARA_BUCKET_NAME,
    Key: key,
    Body: body,
    ContentType: contentType,
    ACL: "public-read", // Ensure file is public
  });

  try {
    await s3Client.send(command);
    // Construct the public URL
    // Format: https://<bucket>.storage.iran.liara.space/<key>
    // Or custom domain if configured
    const publicUrl = `${LIARA_ENDPOINT.replace('https://', `https://${LIARA_BUCKET_NAME}.`)}/${key}`;
    return publicUrl;
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw new Error("Failed to upload file");
  }
}
