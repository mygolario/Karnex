import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const ENDPOINT = process.env.STORAGE_ENDPOINT || process.env.LIARA_ENDPOINT || "https://storage.iran.liara.space";
const BUCKET_NAME = process.env.STORAGE_BUCKET_NAME || process.env.LIARA_BUCKET_NAME || "";
const ACCESS_KEY = process.env.STORAGE_ACCESS_KEY || process.env.LIARA_ACCESS_KEY || "";
const SECRET_KEY = process.env.STORAGE_SECRET_KEY || process.env.LIARA_SECRET_KEY || "";
const REGION = process.env.STORAGE_REGION || "us-east-1";

if (!ACCESS_KEY || !SECRET_KEY || !BUCKET_NAME) {
  console.warn("⚠️ Object Storage credentials are missing. File uploads will fail.");
}

export const s3Client = new S3Client({
  region: REGION,
  endpoint: ENDPOINT,
  credentials: {
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_KEY,
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
    Bucket: BUCKET_NAME,
    Key: key,
    Body: body,
    ContentType: contentType,
    ACL: "public-read", // Ensure file is public
  });

  try {
    await s3Client.send(command);
    
    // Construct the public URL dynamically
    let publicUrl = "";
    if (ENDPOINT.includes("supabase.co")) {
      // Supabase public URL format:
      // https://<project_id>.supabase.co/storage/v1/object/public/<bucket>/<key>
      const baseUrl = ENDPOINT.replace("/storage/v1/s3", "");
      publicUrl = `${baseUrl}/storage/v1/object/public/${BUCKET_NAME}/${key}`;
    } else {
      // Liara/standard S3 subdomain format
      publicUrl = `${ENDPOINT.replace('https://', `https://${BUCKET_NAME}.`)}/${key}`;
    }
    
    return publicUrl;
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw new Error("Failed to upload file");
  }
}
