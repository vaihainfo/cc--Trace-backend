import r from "middleware/error";
import {
    createGarment,
    fetchGarmentPagination,
    updateGarment,
    deleteGarment,
    fetchGarment,
    checkGarment,
    exportGarmentRegistrationList,
    fetchGarmentForPartnerId
} from "../../controllers/process-registration/garment";
import accessControl from "../../middleware/access-control";
import { Router } from "express";
const router = Router();

router.use(accessControl);

// Scope Certificate Routes
router.get('/get-garment-for-partner-id', fetchGarmentForPartnerId);
router.get('/', fetchGarmentPagination);
router.post('/', createGarment);
router.get('/get-garment', fetchGarment);
router.put('/', updateGarment);
router.delete('/', deleteGarment);
router.post('/check-garment', checkGarment);
router.get('/export/registration', exportGarmentRegistrationList);


export default router;  