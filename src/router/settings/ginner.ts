import {
    createGinner,
    fetchGinnerPagination,
    updateGinner,
    deleteGinner
} from "../../controllers/process-registration/ginner";

import { Router } from "express";
const router = Router();

// Scope Certificate Routes
router.get('/', fetchGinnerPagination);
router.post('/', createGinner);
router.put('/', updateGinner);
router.delete('/', deleteGinner);


export default router;  