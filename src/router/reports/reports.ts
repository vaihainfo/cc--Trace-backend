import { fetchValidationProjectReport } from "../../controllers/reports/validation-project-report";
import { getOrganicIntegrityReport } from "../../controllers/reports/integrity-report";
import { fetchTransactionsReport, fetchSumOfQtyPurchasedByProgram } from "../../controllers/reports/procurement-report";
import { Router } from "express";
import { exportNonOrganicFarmerReport, exportOrganicFarmerReport, fetchFarmerReportPagination } from "../../controllers/reports/farmer-reports";
import {
    fetchBaleProcess,
    exportPendingGinnerSales,
    fetchGinSalesPagination,
    exportGinnerProcess,
    exportGinnerSales,
    fetchSpinnerBalePagination
} from "../../controllers/reports";
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
router.get('/get-bale-process-report', fetchBaleProcess);
router.get('/export-bale-process-report', exportGinnerProcess);
router.get('/get-gin-sales-report', fetchGinSalesPagination);
router.get('/export-pending-sales-report', exportPendingGinnerSales);
router.get('/export-gin-sales-report', exportGinnerSales);
router.get('/get-spinner-bale-report', fetchSpinnerBalePagination);

export default router;  