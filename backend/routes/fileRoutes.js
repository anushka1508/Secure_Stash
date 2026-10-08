import express from 'express';
import multer from 'multer';
import { uploadFile, getFiles, shareFile, deleteFile } from '../controllers/fileController.js';
import { protect } from '../middleawre/authMiddleware.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const upload = multer({ storage });

router.use(protect);
router.post('/upload', upload.single('file'), uploadFile);
router.get('/', getFiles);
router.post('/:id/share', shareFile);
router.delete('/:id', deleteFile);

export default router;