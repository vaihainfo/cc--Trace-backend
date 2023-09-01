import {
    createSpinner,
    fetchSpinnerPagination,
    updateSpinner,
    deleteSpinner
} from "../../controllers/process-registration/spinner";

import { Router } from "express";
const router = Router();

// Scope Certificate Routes
router.get('/', fetchSpinnerPagination);
router.post('/', createSpinner);
router.put('/', updateSpinner);
router.delete('/', deleteSpinner);


export default router;  