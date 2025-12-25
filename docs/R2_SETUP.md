# Cloudflare R2 Setup for All Images

## Overview
ALL images (QR codes, task images, user submissions, avatars) are now stored in Cloudflare R2 instead of Supabase Storage or base64 in database. This dramatically reduces storage costs and improves performance.

## Setup Instructions

### 1. Create R2 Bucket
1. Go to Cloudflare Dashboard → R2
2. Create a new bucket named `event-qr-codes` (or your preferred name)
3. Enable public access if you want direct CDN URLs

### 2. Get API Credentials
1. In R2 settings, create an API token
2. Copy your:
   - Account ID
   - Access Key ID
   - Secret Access Key

### 3. Configure Environment Variables
Add to your `.env.local`:

```env
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_r2_access_key
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET_NAME=event-qr-codes
R2_PUBLIC_URL=https://pub-xxxxx.r2.dev
```

### 4. Set Up Public Domain (Optional but Recommended)
1. In R2 bucket settings, connect a custom domain or use R2.dev subdomain
2. Update `R2_PUBLIC_URL` with your public URL

## API Endpoints

### GET /api/qr-codes
Fetch or generate QR code for a task.

**Query Parameters:**
- `taskId` (required): The task ID to generate QR for

**Example:**
```
GET /api/qr-codes?taskId=123
```

**Response:**
```json
{
  "url": "https://pub-xxxxx.r2.dev/qr-codes/task-123.png",
  "cached": true
}
```

### POST /api/upload
Upload any image to R2.

**Body:**
```json
{
  "image": "data:image/jpeg;base64,...",
  "type": "task" | "submission" | "avatar" | "profile",
  "filename": "optional-custom-name.jpg"
}
```

**Response:**
```json
{
  "url": "https://pub-xxxxx.r2.dev/tasks/12345.jpg",
  "success": true
}
```

### POST /api/migrate-images
Migrate existing base64 images from database to R2.

**Body:**
```json
{
  "dryRun": true
}
```

**Response:**
```json
{
  "success": true,
  "dryRun": true,
  "results": {
    "tasks": { "total": 10, "migrated": 8, "failed": 0, "skipped": 2 },
    "submissions": { "total": 50, "migrated": 45, "failed": 1, "skipped": 4 }
  }
}
```

## Migration

### Step 1: Dry Run
Test migration without making changes:

```bash
curl -X POST http://localhost:3000/api/migrate-images \
  -H "Content-Type: application/json" \
  -d '{"dryRun": true}'
```

### Step 2: Actual Migration
Migrate all existing images:

```bash
curl -X POST http://localhost:3000/api/migrate-images \
  -H "Content-Type: application/json" \
  -d '{"dryRun": false}'
```

This will:
1. Fetch all tasks and submissions with image_url/proof_image_url
2. Upload base64 images to R2
3. Update database records with R2 URLs
4. Skip already migrated images (R2 URLs)

**Important:** Run during low-traffic hours. Large migrations may take time.

## Storage Structure

```
R2 Bucket: event-qr-codes
├── qr-codes/
│   ├── task-1.png
│   ├── task-2.png
│   └── task-3.png
├── tasks/
│   ├── 1-1703456789.jpg
│   └── 2-1703456790.jpg
├── submissions/
│   ├── user1-1703456791.jpg
│   └── user2-1703456792.jpg
├── avatars/
│   └── avatar-1.mp4
└── uploads/
    └── misc-files.jpg
```

## Benefits

1. **Massive Cost Savings**: 
   - Supabase: $0.021/GB/month + bandwidth
   - R2: $0.015/GB/month, FREE egress (no bandwidth fees!)
   
2. **Performance**: CDN-backed delivery, global edge network

3. **No Database Bloat**: Base64 images can make DB huge and slow

4. **Control**: Own your assets, no vendor lock-in

5. **Reliability**: No external service dependencies

6. **Caching**: Aggressive caching (1 year) for static assets

## Cost Comparison Example

For 10GB of images with 100GB bandwidth/month:

**Supabase Storage:**
- Storage: $0.21/month
- Bandwidth: ~$9/month
- **Total: ~$9.21/month**

**Cloudflare R2:**
- Storage: $0.15/month
- Bandwidth: $0 (FREE)
- **Total: $0.15/month**

**Savings: 94% reduction!**

## Usage in Code

QR codes are automatically fetched from R2 when you use:

```tsx
// In TaskList component
<img src={`/api/qr-codes?taskId=${task.id}`} />

// Download link
<a href={`/api/qr-codes?taskId=${task.id}`} download>Download QR</a>
```

The API handles caching automatically - QR codes are generated once and stored permanently.
