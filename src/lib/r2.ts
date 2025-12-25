import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";

// Initialize R2 client (R2 is S3-compatible)
const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME || "event-qr-codes";
const PUBLIC_URL = process.env.R2_PUBLIC_URL || "";

function joinUrl(base: string, path: string): string {
  const left = base.endsWith("/") ? base.slice(0, -1) : base;
  const right = path.startsWith("/") ? path.slice(1) : path;
  return `${left}/${right}`;
}

function publicBaseWithBucket(): string {
  if (!PUBLIC_URL) return "";
  // If using cloudflarestorage.com endpoint, include bucket in path for direct access
  const isS3Endpoint = PUBLIC_URL.includes("cloudflarestorage.com");
  if (isS3Endpoint) {
    // S3 endpoint is not a public CDN; prefer proxy route
    return "";
  }
  const needsBucket = !PUBLIC_URL.includes(`/${BUCKET_NAME}`) && !PUBLIC_URL.endsWith(BUCKET_NAME);
  return needsBucket ? PUBLIC_URL : PUBLIC_URL;
}

/**
 * Upload a file to Cloudflare R2
 */
export async function uploadToR2(
  key: string,
  buffer: Buffer,
  contentType: string = "image/png"
): Promise<string> {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000", // Cache for 1 year
    });

    await r2Client.send(command);

    // Return public URL (ensure bucket in path when needed)
    const base = publicBaseWithBucket();
    return base ? joinUrl(base, key) : `/api/media?key=${encodeURIComponent(key)}`;
  } catch (error) {
    console.error("R2 upload error:", error);
    throw new Error(`Failed to upload to R2: ${(error as Error).message}`);
  }
}

/**
 * Get a file from R2
 */
export async function getFromR2(key: string): Promise<Buffer | null> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const response = await r2Client.send(command);
    
    if (!response.Body) {
      return null;
    }

    // Convert stream to buffer
    const chunks: Uint8Array[] = [];
    for await (const chunk of response.Body as any) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  } catch (error) {
    console.error("R2 get error:", error);
    return null;
  }
}

/**
 * Check if a file exists in R2
 */
export async function existsInR2(key: string): Promise<boolean> {
  try {
    const data = await getFromR2(key);
    return data !== null;
  } catch {
    return false;
  }
}

/**
 * Generate public URL for R2 object
 */
export function getR2PublicUrl(key: string): string {
  const base = publicBaseWithBucket();
  return base ? joinUrl(base, key) : `/api/media?key=${encodeURIComponent(key)}`;
}

/**
 * Upload base64 image or video to R2
 */
export async function uploadBase64ImageToR2(
  base64Data: string,
  folder: string,
  filename: string
): Promise<string> {
  // Extract base64 data and mime type
  // Use [\s\S]* to avoid the /s flag for ES targets below 2018
  const matches = base64Data.match(/^data:(.*?);base64,([\s\S]*)$/);
  
  if (!matches || matches.length !== 3) {
    throw new Error("Invalid base64 string");
  }

  const contentType = matches[1].trim();
  const base64Content = matches[2].replace(/\s/g, "");
  const buffer = Buffer.from(base64Content, "base64");

  // Generate unique filename if not provided
  const timestamp = Date.now();
  const mimeType = (contentType.split("/")[1] || "jpg").toLowerCase();
  const ext = mimeType.includes("quick") ? "mov" : mimeType; // Handle quicktime
  const key = `${folder}/${filename || `${timestamp}.${ext}`}`;

  return await uploadToR2(key, buffer, contentType);
}

/**
 * Delete object from R2
 */
export async function deleteFromR2(key: string): Promise<boolean> {
  try {
    const { DeleteObjectCommand } = await import("@aws-sdk/client-s3");
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await r2Client.send(command);
    return true;
  } catch (error) {
    console.error("R2 delete error:", error);
    return false;
  }
}
