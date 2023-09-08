import {
    createQualityParameter,
    fetchQualityParameterPagination,
    fetchQualityParameter,
    exportQualityParameter,
    exportSingleQualityParameter
} from "../../controllers/quality-parameter";

import { Router } from "express";
const router = Router();

// Garment Sales Routes
router.post('/', createQualityParameter);
router.get('/', fetchQualityParameterPagination);
router.get('/get-value', fetchQualityParameter);
router.get('/export', exportQualityParameter);
router.get('/export-single', exportSingleQualityParameter);

export default router;