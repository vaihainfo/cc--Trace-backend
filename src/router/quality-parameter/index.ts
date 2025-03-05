import {
    createQualityParameter,
    fetchQualityParameterPagination,
    fetchQualityParameter,
    exportQualityParameter,
    exportSingleQualityParameter,
    reportParameter,
    reportCountryParameter,
    reportDashBoardParameter,
    reportNationalQualityParameter,
    reporProcessorWiseParameter
} from "../../controllers/quality-parameter";
import accessControl from "../../middleware/access-control";
import { Router } from "express";

const router = Router();

router.use(accessControl);

// Garment Sales Routes
router.post('/', createQualityParameter);
router.get('/', fetchQualityParameterPagination);
router.get('/get-value', fetchQualityParameter);
router.get('/export', exportQualityParameter);
router.get('/export-single', exportSingleQualityParameter);
router.get('/graph', reportParameter);
router.get('/graph-country', reportCountryParameter);
router.get('/graph-dashboard', reportDashBoardParameter);
router.get('/graph-national', reportNationalQualityParameter);
router.get('/graph-processor', reporProcessorWiseParameter);

export default router;