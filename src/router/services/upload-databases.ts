import {
    uploadGarmentType,
    uploadGinnerOrder,
    uploadStyleMark,
    uploadGinnerExpectedSeed,
    uploadVillage,
    uploadFarmer
} from "../../controllers/upload-databases";

import { Router } from "express";
const router = Router();

// Upload databases Routes
router.post('/ginner-order', uploadGinnerOrder);
router.post('/style-mark', uploadStyleMark);
router.post('/garment-type', uploadGarmentType);
router.post('/ginner-expected', uploadGinnerExpectedSeed);
router.post('/village', uploadVillage);
router.post('/farmer', uploadFarmer);
export default router;  