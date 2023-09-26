import {
    createSpinner,
    fetchSpinnerPagination,
    updateSpinner,
    deleteSpinner,
    fetchSpinner,
    checkSpinner
} from "../../controllers/process-registration/spinner";

import { Router } from "express";
const router = Router();

// Scope Certificate Routes
router.get('/', fetchSpinnerPagination);
router.get('/get-spinner', fetchSpinner);
router.post('/', createSpinner);
router.put('/', updateSpinner);
router.delete('/', deleteSpinner);
router.post('/check-spinner', checkSpinner);

export default router;  