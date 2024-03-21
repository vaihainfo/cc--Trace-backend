import {
    createGinner,
    fetchGinnerPagination,
    updateGinner,
    deleteGinner,
    fetchGinner,
    checkGinner,
} from "../../controllers/process-registration/ginner";
import accessControl from "../../middleware/access-control";
import { Router } from "express";
const router = Router();

router.use(accessControl);
// Scope Certificate Routes
router.get('/', fetchGinnerPagination);
router.get('/get-ginner', fetchGinner);
router.post('/', createGinner);
router.put('/', updateGinner);
router.delete('/', deleteGinner);
router.post('/check-ginner', checkGinner);

export default router;  