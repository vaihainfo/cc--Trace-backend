import {
    createIcsName,
    checkIcsNames,
    createIcsNames,
    fetchIcsNamePagination,
    updateIcsName,
    updateIcsNameStatus,
    deleteIcsName
} from "../../controllers/ics-name";
import accessControl from "../../middleware/access-control";
import { Router } from "express";
const router = Router();

router.use(accessControl);

// ICS name Routes
router.get('/', fetchIcsNamePagination);
router.post('/check-ics-names', checkIcsNames);
router.post('/', createIcsName);
router.post('/multiple', createIcsNames);
router.put('/', updateIcsName);
router.put('/status', updateIcsNameStatus);
router.delete('/', deleteIcsName);


export default router;