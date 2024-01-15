import {
    fetchFailedRecords,
    exportFailedRecords
} from "../../controllers/failed-records";

import { Router } from "express";
const router = Router();

// Failed Record Routes
router.get('/', fetchFailedRecords);
router.get('/export', exportFailedRecords);


export default router;