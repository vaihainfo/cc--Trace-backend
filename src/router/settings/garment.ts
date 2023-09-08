import {
    createGarment,
    fetchGarmentPagination,
    updateGarment,
    deleteGarment,
    fetchGarment
} from "../../controllers/process-registration/garment";

import { Router } from "express";
const router = Router();

// Scope Certificate Routes
router.get('/', fetchGarmentPagination);
router.post('/', createGarment);
router.get('/get-garment', fetchGarment);
router.put('/', updateGarment);
router.delete('/', deleteGarment);


export default router;  