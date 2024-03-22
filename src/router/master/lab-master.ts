import {
    createLabMaster,
    createLabMasters,
    deleteLabMaster,
    fetchLabMasterPagination,
    updateLabMaster,
    updateLabMasterStatus
} from "../../controllers/lab-master";
import accessControl from "../../middleware/access-control";
import { Router } from "express";

const router = Router();

router.use(accessControl);

// lab-master Routes
router.get('/', fetchLabMasterPagination);
router.post('/', createLabMaster);
router.post('/multiple', createLabMasters);
router.put('/', updateLabMaster);
router.put('/status', updateLabMasterStatus);
router.delete('/', deleteLabMaster);

export default router;