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

router.post('/', requireAdmin, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const backendUrl = process.env.NODE_ENV === 'production' ? 'https://inches-safety.onrender.com' : 'http://localhost:5000';
  const imageUrl = `${backendUrl}/uploads/${req.file.filename}`;
  res.json({ image_url: imageUrl });
});

router.post('/multiple', requireAdmin, upload.array('images', 5), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }
  const backendUrl = process.env.NODE_ENV === 'production' ? 'https://inches-safety.onrender.com' : 'http://localhost:5000';
  const imageUrls = req.files.map(file => `${backendUrl}/uploads/${file.filename}`);
  res.json({ image_urls: imageUrls });
});

export default router;
