import {
    createQualityParameter,
    fetchQualityParameterPagination,
    fetchQualityParameter,
    exportQualityParameter,
    exportSingleQualityParameter,
    reportParameter,
    reportCountryParameter,
    reportDashBoardParameter
} from "../../controllers/quality-parameter";

import { Router } from "express";
const router = Router();

// Garment Sales Routes
router.post('/', createQualityParameter);
router.get('/', fetchQualityParameterPagination);
router.get('/get-value', fetchQualityParameter);
router.get('/export', exportQualityParameter);
router.get('/export-single', exportSingleQualityParameter);
router.get('/graph', reportParameter);
router.get('/graph-country', reportCountryParameter);
router.get('/graph-dashboard', reportDashBoardParameter);

export default router;