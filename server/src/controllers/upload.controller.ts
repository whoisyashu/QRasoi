import type { RequestHandler } from 'express'; import { cloudinaryService } from '../services/cloudinary.service.js'; import { ok } from '../utils/response.js';
export const signUpload:RequestHandler=(req,res)=>ok(res,'Upload signature created',cloudinaryService.signature(`qrasoi/${req.auth!.restaurantId}/${req.body.kind}`));
