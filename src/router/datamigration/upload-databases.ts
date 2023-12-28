import {
    uploadGarmentType,
    uploadGinnerProcess   
} from "../../controllers/datamigration";

import { Router } from "express";
const router = Router();

// Upload databases Routes
router.post('/upload-ginner-process', uploadGinnerProcess);
router.post('/garment-type', uploadGarmentType);


export default router;  