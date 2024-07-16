import {
    createSpinner,
    fetchSpinnerPagination,
    updateSpinner,
    deleteSpinner,
    fetchSpinner,
    checkSpinner,
    exportSpinnerRegistrationList
} from "../../controllers/process-registration/spinner";
import accessControl from "../../middleware/access-control";
import { Router } from "express";
const router = Router();

router.use(accessControl);

// Scope Certificate Routes
router.get('/', fetchSpinnerPagination);
router.get('/get-spinner', fetchSpinner);
router.post('/', createSpinner);
router.put('/', updateSpinner);
router.delete('/', deleteSpinner);
router.post('/check-spinner', checkSpinner);
router.get('/export/registration', exportSpinnerRegistrationList);

export default router;  