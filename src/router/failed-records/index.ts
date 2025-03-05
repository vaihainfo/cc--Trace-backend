import {
    fetchFailedRecords,
    exportFailedRecords
} from "../../controllers/failed-records";
import accessControl from "../../middleware/access-control";
import { Router } from "express";

const router = Router();

router.use(accessControl);

// Failed Record Routes
router.get('/', fetchFailedRecords);
router.get('/export', exportFailedRecords);


export default router;