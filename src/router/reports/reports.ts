import { fetchValidationProjectReport } from "../../controllers/reports/validation-project-report";
import { getOrganicIntegrityReport } from "../../controllers/reports/integrity-report";
import { fetchTransactionsReport, fetchSumOfQtyPurchasedByProgram } from "../../controllers/reports/procurement-report";
import { Router } from "express";
import { exportNonOrganicFarmerReport, exportOrganicFarmerReport, fetchFarmerReportPagination } from "../../controllers/reports/farmer-reports";
const router = Router();

// Transaction Report Route
router.get('/get-transactions', fetchTransactionsReport);
router.get('/get-procured-quantities', fetchSumOfQtyPurchasedByProgram);


router.get('/get-organic-integrity-report', getOrganicIntegrityReport);

router.get('/get-validation-project-report', fetchValidationProjectReport);
//farmer Report for Organic and Non Organic
router.get('/get-farmer-report', fetchFarmerReportPagination);
router.get('/export-non-farmer-report', exportNonOrganicFarmerReport);
router.get('/export-organic-farmer-report', exportOrganicFarmerReport);
export default router;  