import {
    createIcsName,
    createIcsNames,
    fetchIcsNamePagination,
    updateIcsName,
    updateIcsNameStatus,
    deleteIcsName
} from "../../controllers/ics-name";

import { Router } from "express";
import accessControl from "../../middleware/access-control";
const router = Router();

router.use(accessControl)

// ICS name Routes
router.get('/', fetchIcsNamePagination);
router.post('/', createIcsName);
router.post('/multiple', createIcsNames);
router.put('/', updateIcsName);
router.put('/status', updateIcsNameStatus);
router.delete('/', deleteIcsName);


export default router;