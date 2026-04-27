# Cloudflare R2 Setup Guide

## ✅ What's Already Done

1. ✅ Installed AWS SDK for S3-compatible storage
2. ✅ Created R2 storage module (`r2-storage.js`)
3. ✅ Updated server.js to use R2 with local fallback
4. ✅ Added R2 configuration to `.env` file

## 🔧 What You Need to Do

### Step 1: Create R2 Bucket

1. Go to Cloudflare Dashboard: https://dash.cloudflare.com
2. Navigate to **R2** in the left sidebar
3. Click **Create bucket**
4. Bucket name: `dealnamaa-offers` (or any name you prefer)
5. Location: Choose closest to your users (e.g., APAC for Middle East)
6. Click **Create bucket**

### Step 2: Get R2 Access Keys

The API token you provided is for API verification, not for file uploads. You need **R2 Access Keys**:

1. In Cloudflare Dashboard, go to **R2**
2. Click **Manage R2 API Tokens** (top right)
3. Click **Create API Token**
4. Token name: `dealnamaa-uploads`
5. Permissions: **Object Read & Write**
6. Specify bucket: Select `dealnamaa-offers` (or your bucket name)
7. Click **Create API Token**

You'll get:
- **Access Key ID** (looks like: `abc123def456...`)
- **Secret Access Key** (looks like: `xyz789abc123...`)

⚠️ **IMPORTANT**: Copy both keys immediately - the secret key is shown only once!

### Step 3: Enable Public Access (Optional but Recommended)

To make uploaded files publicly accessible:

1. Go to your bucket in R2 dashboard
2. Click **Settings** tab
3. Under **Public Access**, click **Allow Access**
4. You'll get a public URL like: `https://pub-abc123.r2.dev`

### Step 4: Update .env File

Replace the placeholder values in your `.env` file:

```env
# Cloudflare R2 Storage
R2_ACCOUNT_ID=9dbbac406d8e5dc06fb440e4a5147dd7
R2_ACCESS_KEY_ID=<paste your Access Key ID here>
R2_SECRET_ACCESS_KEY=<paste your Secret Access Key here>
R2_BUCKET_NAME=dealnamaa-offers
R2_PUBLIC_URL=https://pub-abc123.r2.dev
```

### Step 5: Restart Your Server

```bash
# Stop the server (Ctrl+C)
npm start
```

You should see:
```
☁️ Cloudflare R2 storage is configured and will be used for uploads
```

### Step 6: Test Upload

1. Go to admin panel: http://localhost:3000/admin.html
2. Try uploading an image or PDF
3. Check the console - you should see: `✅ File uploaded to Cloudflare R2: https://...`

## 🔍 Troubleshooting

### "R2 not configured, using local storage"
- Check all R2 environment variables are set in `.env`
- Restart the server after updating `.env`

### "R2 upload failed, falling back to local storage"
- Check Access Key ID and Secret Access Key are correct
- Verify bucket name matches exactly
- Check bucket permissions allow Object Read & Write

### Files upload but don't display
- Enable public access on your R2 bucket
- Update `R2_PUBLIC_URL` with the correct public URL

## 💰 Cost Estimate

With Cloudflare R2:
- **Storage**: $0.015/GB/month
- **Egress**: $0 (FREE!)
- **Operations**: $4.50 per million writes

For 100GB storage + 500GB downloads/month:
- Storage: 100GB × $0.015 = **$1.50/month**
- Egress: 500GB × $0 = **$0**
- **Total: $1.50/month** 🎉

Compare to AWS S3: ~$45/month for same usage!

## 🚀 Next Steps

Once R2 is working:

1. **Test thoroughly**: Upload various file types (PDF, JPG, PNG)
2. **Monitor usage**: Check R2 dashboard for storage/bandwidth stats
3. **Migrate existing files**: Run migration script to move `/uploads` to R2
4. **Update documentation**: Note R2 setup in deployment docs

## 📝 Migration Script (Optional)

To migrate existing local files to R2:

```bash
node migrate-to-r2.js
```

(I can create this script if you need it)

## ✅ Verification Checklist

- [ ] R2 bucket created
- [ ] R2 Access Keys obtained
- [ ] Public access enabled on bucket
- [ ] `.env` file updated with all R2 credentials
- [ ] Server restarted
- [ ] Test upload successful
- [ ] Uploaded file accessible via public URL

---

**Need Help?** Check the console logs when uploading - they'll show whether R2 or local storage is being used.
