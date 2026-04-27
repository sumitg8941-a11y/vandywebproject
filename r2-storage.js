const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const path = require('path');

// Initialize R2 client
const r2Client = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
});

/**
 * Upload file to Cloudflare R2
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} originalName - Original filename
 * @param {string} mimeType - File MIME type
 * @returns {Promise<string>} - Public URL of uploaded file
 */
async function uploadToR2(fileBuffer, originalName, mimeType) {
    const key = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(originalName)}`;
    
    const command = new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
        Body: fileBuffer,
        ContentType: mimeType,
    });

    await r2Client.send(command);
    
    // Return public URL
    return `${process.env.R2_PUBLIC_URL}/${key}`;
}

/**
 * Delete file from Cloudflare R2
 * @param {string} fileUrl - Full URL of the file
 * @returns {Promise<void>}
 */
async function deleteFromR2(fileUrl) {
    // Extract key from URL
    const key = fileUrl.split('/').pop();
    
    const command = new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
    });

    await r2Client.send(command);
}

/**
 * Check if R2 is configured
 * @returns {boolean}
 */
function isR2Configured() {
    return !!(
        process.env.R2_ACCOUNT_ID &&
        process.env.R2_ACCESS_KEY_ID &&
        process.env.R2_SECRET_ACCESS_KEY &&
        process.env.R2_BUCKET_NAME &&
        process.env.R2_PUBLIC_URL
    );
}

module.exports = {
    uploadToR2,
    deleteFromR2,
    isR2Configured,
};
