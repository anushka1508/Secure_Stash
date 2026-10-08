import File from '../models/File.js';
import User from '../models/User.js';
import fs from 'fs';

export const uploadFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Please upload a file' });

    let category = 'other';
    if (req.file.mimetype.startsWith('image/')) category = 'image';
    else if (req.file.mimetype.startsWith('video/')) category = 'video';
    else if (req.file.mimetype.includes('pdf') || req.file.mimetype.includes('word')) category = 'document';

    const newFile = await File.create({
      name: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      mimeType: req.file.mimetype,
      owner: req.user._id,
      category
    });

    res.status(201).json(newFile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFiles = async (req, res) => {
  try {
    const files = await File.find({
      $or: [
        { owner: req.user._id },
        { sharedWith: { $in: [req.user._id] } }
      ]
    }).populate('owner', 'name email').populate('sharedWith', 'name email');

    res.json(files);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const shareFile = async (req, res) => {
  const email = req.body.email?.trim();
  if (!email) return res.status(400).json({ message: 'Email is required' });

  try {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ message: 'File not found' });
    if (file.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only owner can share this file' });
    }

    const normalizedEmail = email.toLowerCase();
    const userToShare = await User.findOne({
      $expr: { $eq: [{ $toLower: '$email' }, normalizedEmail] }
    });
    if (!userToShare) return res.status(404).json({ message: 'User to share with not found' });

    if (!file.sharedWith.some((sharedUserId) => sharedUserId.equals(userToShare._id))) {
      file.sharedWith.push(userToShare._id);
      await file.save();
    }

    res.json({ message: 'File shared successfully', file });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ message: 'File not found' });
    if (file.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete' });
    }

    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    await File.findByIdAndDelete(req.params.id);
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};