import {
    createSpinner,
    fetchSpinnerPagination,
    updateSpinner,
    deleteSpinner,
    fetchSpinner
} from "../../controllers/process-registration/spinner";

import { Router } from "express";
const router = Router();

// Scope Certificate Routes
router.get('/', fetchSpinnerPagination);
router.get('/get-spinner', fetchSpinner);
router.post('/', createSpinner);
router.put('/', updateSpinner);
router.delete('/', deleteSpinner);


export default router;  