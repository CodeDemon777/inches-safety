import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { requireAdmin } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });
const router = express.Router();

router.get('/list', requireAdmin, (req, res) => {
  try {
    const files = fs.readdirSync(uploadDir);
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.get('host');
    const backendUrl = `${protocol}://${host}`;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
    const imageUrls = files
      .filter(file => imageExtensions.includes(path.extname(file).toLowerCase()))
      .map(file => `${backendUrl}/uploads/${file}`);
    res.json({ image_urls: imageUrls });
  } catch (err) {
    res.status(500).json({ error: 'Failed to read uploads directory: ' + err.message });
  }
});

router.post('/', requireAdmin, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const host = req.get('host');
  const backendUrl = `${protocol}://${host}`;
  const imageUrl = `${backendUrl}/uploads/${req.file.filename}`;
  res.json({ image_url: imageUrl });
});

router.post('/multiple', requireAdmin, upload.array('images', 5), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const host = req.get('host');
  const backendUrl = `${protocol}://${host}`;
  const imageUrls = req.files.map(file => `${backendUrl}/uploads/${file.filename}`);
  res.json({ image_urls: imageUrls });
});

export default router;
