// controllers/handbookController.js
const Handbook = require('../models/Handbook');
const fs = require('fs').promises;
const path = require('path');

// @desc    Get all handbooks
// @route   GET /api/handbook
// @access  Private
const getHandbooks = async (req, res) => {
  try {
    console.log('Fetching handbooks...');
    const handbooks = await Handbook.find()
      .sort({ createdAt: -1 })
      .populate('uploadedBy', 'name');
    
    console.log('Found handbooks:', handbooks);
    res.json({ files: handbooks });
  } catch (error) {
    console.error('Error fetching handbooks:', error);
    res.status(500).json({ 
      message: 'Error fetching handbooks',
      error: error.message 
    });
  }
};

// @desc    Upload handbook files
// @route   POST /api/handbook/upload
// @access  Private/Admin
const uploadHandbook = async (req, res) => {
  try {
    console.log('Uploading handbooks...', req.files);
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const handbooks = await Promise.all(
      req.files.map(async (file) => {
        const handbook = new Handbook({
          filename: file.filename,
          originalname: file.originalname,
          path: file.path,
          uploadedBy: req.user._id,
          size: file.size
        });
        return handbook.save();
      })
    );
    console.log('Uploaded handbooks:', handbooks);
    res.status(201).json(handbooks);
  } catch (error) {
    console.error('Error uploading handbooks:', error);
    res.status(500).json({ 
      message: 'Error uploading handbooks',
      error: error.message 
    });
  }
};

// @desc    Delete handbook
// @route   DELETE /api/handbook/:id
// @access  Private/Admin
const deleteHandbook = async (req, res) => {
  try {
    const handbook = await Handbook.findById(req.params.id);
    
    if (!handbook) {
      return res.status(404).json({ message: 'Handbook not found' });
    }

    // Delete file from filesystem
    await fs.unlink(handbook.path);
    // Delete from database
    await handbook.deleteOne();

    res.json({ message: 'Handbook deleted successfully' });
  } catch (error) {
    console.error('Error deleting handbook:', error);
    res.status(500).json({ 
      message: 'Error deleting handbook',
      error: error.message 
    });
  }
};

// @desc    Download handbook
// @route   GET /api/handbook/download/:id
// @access  Private
const downloadHandbook = async (req, res) => {
  try {
    const handbook = await Handbook.findById(req.params.id);
    
    if (!handbook) {
      return res.status(404).json({ message: 'Handbook not found' });
    }

    // Verify file exists
    try {
      await fs.access(handbook.path);
    } catch (error) {
      console.error('File not found on disk:', error);
      return res.status(404).json({ message: 'Handbook file not found' });
    }

    // Set headers for file download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition', 
      `attachment; filename="${handbook.originalname}"`
    );

    // Stream the file instead of loading it all into memory
    const fileStream = fs.createReadStream(handbook.path);
    fileStream.pipe(res);

    // Handle streaming errors
    fileStream.on('error', (error) => {
      console.error('Error streaming file:', error);
      if (!res.headersSent) {
        res.status(500).json({ message: 'Error downloading file' });
      }
    });
  } catch (error) {
    console.error('Error downloading handbook:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Error downloading handbook' });
    }
  }
};

module.exports = {
  getHandbooks,
  uploadHandbook,
  deleteHandbook
};