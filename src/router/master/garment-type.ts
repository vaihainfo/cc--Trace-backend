import { createGarmentType, checkGarmentTypes, createGarmentTypes, deleteGarmentType, fetchGarmentTypePagination, updateGarmentType, updateGarmentTypeStatus } from "../../controllers/garment-type";
import accessControl from "../../middleware/access-control";
import { Router } from "express";
const router = Router();

// router.use(accessControl);

// Department Routes
router.get('/', fetchGarmentTypePagination);
router.post('/check-garment-types', checkGarmentTypes);
router.post('/', createGarmentType);
router.post('/multiple', createGarmentTypes);
router.put('/', updateGarmentType);
router.put('/status', updateGarmentTypeStatus);
router.delete('/', deleteGarmentType);


export default router;