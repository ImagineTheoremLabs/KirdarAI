const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { protect } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/adminMiddleware');
const Handbook = require('../models/Handbook');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../uploads');
fs.mkdir(uploadDir, { recursive: true }).catch(console.error);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Routes
router.get('/', protect, async (req, res) => {
  try {
    const handbooks = await Handbook.find().sort({ createdAt: -1 });
    res.json({ files: handbooks });
  } catch (error) {
    console.error('Error fetching handbooks:', error);
    res.status(500).json({ message: 'Error fetching handbooks' });
  }
});

router.post('/upload', protect, requireAdmin, upload.array('handbooks', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const handbooks = await Promise.all(
      req.files.map(async (file) => {
        const handbook = await Handbook.create({
          filename: file.filename,
          originalname: file.originalname,
          path: file.path,
          uploadedBy: req.user._id,
          size: file.size
        });
        return handbook;
      })
    );

    res.status(201).json(handbooks);
  } catch (error) {
    console.error('Error uploading handbooks:', error);
    res.status(500).json({ message: 'Error uploading handbooks' });
  }
});

router.delete('/:id', protect, requireAdmin, async (req, res) => {
  try {
    const handbook = await Handbook.findById(req.params.id);
    
    if (!handbook) {
      return res.status(404).json({ message: 'Handbook not found' });
    }

    // Delete file from filesystem
    try {
      await fs.unlink(handbook.path);
    } catch (error) {
      console.error('Error deleting file:', error);
    }

    // Delete from database
    await handbook.deleteOne();
    res.json({ message: 'Handbook deleted successfully' });
  } catch (error) {
    console.error('Error deleting handbook:', error);
    res.status(500).json({ message: 'Error deleting handbook' });
  }
});

router.get('/download/:id', protect, async (req, res) => {
  try {
    const handbook = await Handbook.findById(req.params.id);
    
    if (!handbook) {
      return res.status(404).json({ message: 'Handbook not found' });
    }

    // Check if file exists
    try {
      await fs.access(handbook.path);
    } catch (error) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${handbook.originalname}"`);
    
    const fileStream = fs.createReadStream(handbook.path);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error downloading handbook:', error);
    res.status(500).json({ message: 'Error downloading handbook' });
  }
});

module.exports = router;