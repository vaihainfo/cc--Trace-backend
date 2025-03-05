import {
    uploadGinBales,
    uploadGinnerProcess,
    uploadGinCottonselection,
    uploadGinnerSale,
    uploadBalesSelection,
    createGinnerProcessor
} from "../../controllers/datamigration";

import { Router } from "express";
const router = Router();

// Upload databases Routes
router.post('/upload-ginner-process', uploadGinnerProcess);
router.post('/upload-gin-bales', uploadGinBales);
router.post('/upload-cotton-selection', uploadGinCottonselection);
router.post('/upload-ginner-sale', uploadGinnerSale);
router.post('/upload-bale-selection', uploadBalesSelection);


// Processor Registration
router.post('/upload-ginner-processor-registration', createGinnerProcessor);

export default router;  