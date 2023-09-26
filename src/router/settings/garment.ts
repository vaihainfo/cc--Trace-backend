import {
    createGarment,
    fetchGarmentPagination,
    updateGarment,
    deleteGarment,
    fetchGarment,
    checkGarment
} from "../../controllers/process-registration/garment";

import { Router } from "express";
const router = Router();

// Scope Certificate Routes
router.get('/', fetchGarmentPagination);
router.post('/', createGarment);
router.get('/get-garment', fetchGarment);
router.put('/', updateGarment);
router.delete('/', deleteGarment);
router.post('/check-garment', checkGarment);


export default router;  