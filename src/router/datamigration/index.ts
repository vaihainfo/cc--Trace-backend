import {
    uploadGinBales,
    uploadGinnerProcess,
    uploadGinCottonselection   
} from "../../controllers/datamigration";

import { Router } from "express";
const router = Router();

// Upload databases Routes
router.post('/upload-ginner-process', uploadGinnerProcess);
router.post('/upload-gin-bales', uploadGinBales);
router.post('/upload-cotton-selection', uploadGinCottonselection);

export default router;  