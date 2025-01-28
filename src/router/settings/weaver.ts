import {
    createWeaver,
    fetchWeaverPagination,
    updateWeaver,
    deleteWeaver,
    fetchWeaver,
    checkWeaver,
    exportWeaverRegistrationList
} from "../../controllers/process-registration/weaver";
import accessControl from "../../middleware/access-control";
import { Router } from "express";
const router = Router();

router.use(accessControl);

// Scope Certificate Routes
router.get('/', fetchWeaverPagination);
router.get('/get-weaver', fetchWeaver);
router.post('/', createWeaver);
router.put('/', updateWeaver);
router.delete('/', deleteWeaver);
router.post('/check-weaver', checkWeaver);
router.get('/export/registration', exportWeaverRegistrationList);

export default router;  