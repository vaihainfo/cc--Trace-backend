import {
    createProcessor,
    fetchAllProcessor
} from "../../controllers/process-registration/new-processor";

import { Router } from "express";
const router = Router();

// Scope Certificate Routes
router.post('/', createProcessor);
router.get('/get-processor', fetchAllProcessor);

export default router;  