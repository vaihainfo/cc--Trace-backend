import {
    uploadGinBales,
    uploadGinnerProcess   
} from "../../controllers/datamigration";

import { Router } from "express";
const router = Router();

// Upload databases Routes
router.post('/upload-ginner-process', uploadGinnerProcess);
router.post('/upload-gin-bales', uploadGinBales);


export default router;  