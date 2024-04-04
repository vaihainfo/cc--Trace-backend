import {
    uploadGarmentType,
    uploadGinnerOrder,
    uploadStyleMark,
    uploadGinnerExpectedSeed,
    uploadVillage,
    uploadFarmer,
    uploadProcessorList,
    uploadProcurementPrice,
    uploadImpactData
} from "../../controllers/upload-databases";
import accessControl from "../../middleware/access-control";
import { Router } from "express";

const router = Router();

router.use(accessControl);
// Upload databases Routes
router.post('/ginner-order', uploadGinnerOrder);
router.post('/style-mark', uploadStyleMark);
router.post('/garment-type', uploadGarmentType);
router.post('/ginner-expected', uploadGinnerExpectedSeed);
router.post('/village', uploadVillage);
router.post('/farmer', uploadFarmer);
router.post('/processor-list', uploadProcessorList);
router.post('/procurement-price', uploadProcurementPrice);
router.post('/impact/data', uploadImpactData)

export default router;  