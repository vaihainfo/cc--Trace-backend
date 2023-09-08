import {
    createGinner,
    fetchGinnerPagination,
    updateGinner,
    deleteGinner,
    fetchGinner
} from "../../controllers/process-registration/ginner";

import { Router } from "express";
const router = Router();

// Scope Certificate Routes
router.get('/', fetchGinnerPagination);
router.get('/get-ginner', fetchGinner);
router.post('/', createGinner);
router.put('/', updateGinner);
router.delete('/', deleteGinner);


export default router;  