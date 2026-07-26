import { Router } from 'express';
import { getCloudinaryUploadSignature } from '../controllers/cloudinary.controller.js';

const router = Router();
router.get('/signature', getCloudinaryUploadSignature);

export default router;
