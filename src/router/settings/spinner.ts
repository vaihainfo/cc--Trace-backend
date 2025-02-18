import {
    createSpinner,
    fetchSpinnerPagination,
    updateSpinner,
    deleteSpinner,
    fetchSpinner,
    checkSpinner,
    exportSpinnerRegistrationList
} from "../../controllers/process-registration/spinner";
import {
    createSpinnerYarnOrder,
    getSpinnerYarnOrders,
    getSpinnerYarnOrderById,
    updateSpinnerYarnOrder,
    deleteSpinnerYarnOrder
} from "../../controllers/spinner/spinnerYarnOrderController";
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

// Yarn Order Routes
router.post('/yarn-order', createSpinnerYarnOrder);
router.get('/yarn-order', getSpinnerYarnOrders);
router.get('/yarn-order/:id', getSpinnerYarnOrderById);
router.put('/yarn-order/:id', updateSpinnerYarnOrder);
router.delete('/yarn-order/:id', deleteSpinnerYarnOrder);

export default router;  