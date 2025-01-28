import {
    createKnitter,
    fetchKnitterPagination,
    updateKnitter,
    deleteKnitter,
    fetchKnitter,
    checkKnitter,
    exportKnitterRegistrationList
} from "../../controllers/process-registration/knitter";
import accessControl from "../../middleware/access-control";
import { Router } from "express";
const router = Router();

router.use(accessControl);
// Scope Certificate Routes
router.get('/', fetchKnitterPagination);
router.get('/get-knitter', fetchKnitter);
router.post('/', createKnitter);
router.put('/', updateKnitter);
router.delete('/', deleteKnitter);
router.post('/check-knitter', checkKnitter);
router.get('/export/registration', exportKnitterRegistrationList);

export default router;  