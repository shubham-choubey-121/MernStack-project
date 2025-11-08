const fs = require('fs');
const path = require('path');
const { S3Client, PutObjectCommand, ListObjectsV2Command, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { v4: uuidv4 } = require('uuid');

// Configure S3 client from env vars (if AWS_REGION is unset, client will still be created but BUCKET will be falsy)
const BUCKET = process.env.S3_BUCKET;
const AWS_REGION = process.env.AWS_REGION;
const s3 = BUCKET && AWS_REGION ? new S3Client({ region: AWS_REGION }) : null;

const buildS3Url = (key) => {
  const region = process.env.AWS_REGION || 'us-east-1';
  return `https://${BUCKET}.s3.${region}.amazonaws.com/${encodeURIComponent(key)}`;
};

// Local uploads fallback directory
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  try { fs.mkdirSync(UPLOAD_DIR); } catch (e) { /* ignore */ }
}

const uploadImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    // If S3 is configured, upload there. Otherwise, fallback to local disk (for local dev).
    if (s3 && BUCKET) {
      const ext = req.file.originalname.split('.').pop();
      const key = `images/${Date.now()}-${uuidv4()}.${ext}`;

      const put = new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
        ACL: 'public-read'
      });

      await s3.send(put);
      const url = buildS3Url(key);
      return res.status(201).json({ filename: key, url });
    }

    // Local fallback: write buffer to uploads/ and return local URL
    const filename = Date.now() + '-' + uuidv4() + '-' + req.file.originalname.replace(/[^a-zA-Z0-9.\-]/g, '_');
    const dest = path.join(UPLOAD_DIR, filename);
    fs.writeFileSync(dest, req.file.buffer);
    const url = `${req.protocol}://${req.get('host')}/uploads/${filename}`;
    return res.status(201).json({ filename, url });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const listImages = async (req, res) => {
  try {
    if (s3 && BUCKET) {
      const list = new ListObjectsV2Command({ Bucket: BUCKET, Prefix: 'images/' });
      const data = await s3.send(list);
      const files = (data.Contents || []).map((item) => ({ filename: item.Key, url: buildS3Url(item.Key) }));
      return res.json(files);
    }

    // Local fallback
    if (!fs.existsSync(UPLOAD_DIR)) return res.json([]);
    const files = fs.readdirSync(UPLOAD_DIR).map((filename) => ({ filename, url: `${req.protocol}://${req.get('host')}/uploads/${filename}` }));
    return res.json(files);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteImage = async (req, res) => {
  try {
    const { filename } = req.params;
    if (!filename) return res.status(400).json({ message: 'Filename required' });

    if (s3 && BUCKET) {
      const del = new DeleteObjectCommand({ Bucket: BUCKET, Key: filename });
      await s3.send(del);
      return res.json({ message: 'Image deleted successfully' });
    }

    // Local fallback
    const filePath = path.join(UPLOAD_DIR, filename);
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'File not found' });
    fs.unlinkSync(filePath);
    return res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  uploadImage,
  listImages,
  deleteImage
};
