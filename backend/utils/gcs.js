const { Storage } = require('@google-cloud/storage');
const path = require('path');

// Initialize GCS
const storage = new Storage({
  projectId: process.env.GCS_PROJECT_ID,
  credentials: {
    client_email: process.env.GCS_CLIENT_EMAIL,
    private_key: process.env.GCS_PRIVATE_KEY ? process.env.GCS_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
  },
});

const bucketName = process.env.GCS_BUCKET_NAME;
const bucket = storage.bucket(bucketName);

/**
 * Uploads a buffer to GCS
 * @param {Buffer} buffer - File buffer
 * @param {string} destination - Path in bucket
 * @param {string} mimetype - Content type
 * @returns {Promise<string>} - Public URL or GCS path
 */
const uploadToGCS = (buffer, destination, mimetype) => {
  return new Promise((resolve, reject) => {
    const file = bucket.file(destination);
    const stream = file.createWriteStream({
      metadata: {
        contentType: mimetype,
      },
      resumable: false,
    });

    stream.on('error', (err) => {
      console.error('GCS Upload Error:', err);
      reject(err);
    });

    stream.on('finish', async () => {
      // Option 1: Return public URL (requires bucket to be public or signed URL)
      // For simplicity in this app, we'll return a path that our backend can handle or a direct GCS link
      const publicUrl = `https://storage.googleapis.com/${bucketName}/${destination}`;
      resolve(publicUrl);
    });

    stream.end(buffer);
  });
};

module.exports = {
  uploadToGCS,
  bucket
};
