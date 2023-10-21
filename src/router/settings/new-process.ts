import {
    createProcessor,
    fetchAllProcessor,
    checkProcessorName,
    updateProcessor
} from "../../controllers/process-registration/new-processor";

import { Router } from "express";
const router = Router();

// Scope Certificate Routes
router.post('/', createProcessor);
router.put('/', updateProcessor);

router.get('/get-processor', fetchAllProcessor);
router.post('/check-name', checkProcessorName);

export default router;  