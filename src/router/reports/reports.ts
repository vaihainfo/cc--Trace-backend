import { fetchValidationProjectReport } from "../../controllers/reports/validation-project-report";
import { getOrganicIntegrityReport } from "../../controllers/reports/integrity-report";
import { fetchTransactionsReport, fetchSumOfQtyPurchasedByProgram, exportProcurementReport } from "../../controllers/reports/procurement-report";
import { Router } from "express";
import { exportNonOrganicFarmerReport, exportOrganicFarmerReport, fetchFarmerReportPagination } from "../../controllers/reports/farmer-reports";
import {
    fetchBaleProcess,
    exportPendingGinnerSales,
    fetchGinSalesPagination,
    fetchPendingGinnerSales,
    exportGinnerProcess,
    exportGinnerSales,
    fetchSpinnerBalePagination,
    exportPendingSpinnerBale,
    exportSpinnerBale,
    exportSpinnerYarnProcess,
    fetchSpinnerYarnProcessPagination,
    fetchSpinSalesPagination,
    exportSpinnerSale,
    fetchKnitterYarnPagination,
    exportKnitterYarn,
    fetchKnitterSalesPagination,
    exportKnitterSale,
    fetchWeaverYarnPagination,
    exportWeaverYarn,
    fetchWeaverSalesPagination,
    exportWeaverSale,
    fetchQrCodeTrackPagination,
    exportQrCodeTrack,
    fetchSpinnerSummaryPagination,
    exportSpinnerSummary,
    fetchGinnerSummaryPagination,
    exportGinnerSummary,
    fetchGarmentSalesPagination,
    exportGarmentSales,
    fetchPscpPrecurement,
    exportPscpCottonProcurement,
    consolidatedTraceability,
    fetchPscpGinnerPrecurement,
    exportPscpGinnerCottonProcurement,
    fetchPscpProcurementLiveTracker,
    exportPscpProcurementLiveTracker,
    fetchGinnerCottonStock,
    exportGinnerCottonStock,
    fetchSpinnerPendingBale,
    fetchSpinnerLintCottonStock,
    exportSpinnerCottonStock,
    fetchKnitterYarnProcess,
    exportKnitterYarnProcess,
    fetchWeaverYarnProcess,
    exportWeaverYarnProcess,
    fetchGarmentFabricReceipt,
    exportGarmentFabricReceipt,
    fetchGarmentFabricProcess,
    exportGarmentFabricProcess,
    getGarmentSalesFilter,
    exportConsolidatedTraceability,
    villageSeedCottonReport,
    exportVillageSeedCotton,
    spinnerBackwardTraceabiltyReport,
    exportSpinnerBackwardTraceability,
    exportLoad
} from "../../controllers/reports";
const router = Router();

// Transaction Report Route
router.get('/get-transactions', fetchTransactionsReport);
router.get('/export-procurement-report', exportProcurementReport);
router.get('/get-procured-quantities', fetchSumOfQtyPurchasedByProgram);


router.get('/get-organic-integrity-report', getOrganicIntegrityReport);

router.get('/get-validation-project-report', fetchValidationProjectReport);
//farmer Report for Organic and Non Organic
router.get('/get-farmer-report', fetchFarmerReportPagination);
router.get('/export-non-farmer-report', exportNonOrganicFarmerReport);
router.get('/export-organic-farmer-report', exportOrganicFarmerReport);
router.get('/get-bale-process-report', fetchBaleProcess);
router.get('/export-bale-process-report', exportGinnerProcess);
router.post("/check-export-load",exportLoad)
router.get('/get-gin-sales-report', fetchGinSalesPagination);
router.get('/get-gin-pending-sales-report', fetchPendingGinnerSales);
router.get('/export-pending-sales-report', exportPendingGinnerSales);
router.get('/export-gin-sales-report', exportGinnerSales);
router.get('/get-spinner-bale-report', fetchSpinnerBalePagination);
router.get('/get-spinner-pending-bale-report', fetchSpinnerPendingBale);
router.get('/export-spinner-pending-bale-report', exportPendingSpinnerBale);
router.get('/export-spinner-bale-report', exportSpinnerBale);
router.get('/get-spinner-yarn-report', fetchSpinnerYarnProcessPagination);
router.get('/export-spinner-yarn-report', exportSpinnerYarnProcess);
router.get('/get-spinner-yarn-sales-report', fetchSpinSalesPagination);
router.get('/export-spinner-yarn-sales-report', exportSpinnerSale);
router.get('/get-knitter-yarn-report', fetchKnitterYarnPagination);
router.get('/export-knitter-yarn-report', exportKnitterYarn);
router.get('/get-knitter-yarn-process-report', fetchKnitterYarnProcess);
router.get('/export-knitter-yarn-process-report', exportKnitterYarnProcess);
router.get('/get-knitter-sales-report', fetchKnitterSalesPagination);
router.get('/export-knitter-sales-report', exportKnitterSale);
router.get('/get-weaver-yarn-report', fetchWeaverYarnPagination);
router.get('/export-weaver-yarn-report', exportWeaverYarn);
router.get('/get-weaver-yarn-process-report', fetchWeaverYarnProcess);
router.get('/export-weaver-yarn-process-report', exportWeaverYarnProcess);
router.get('/get-weaver-sales-report', fetchWeaverSalesPagination);
router.get('/export-weaver-sales-report', exportWeaverSale);
router.get('/get-Qr-track-report', fetchQrCodeTrackPagination);
router.get('/export-Qr-trackreport', exportQrCodeTrack);
router.get('/get-spinner-summary-report', fetchSpinnerSummaryPagination);
router.get('/export-spinner-summary-report', exportSpinnerSummary);
router.get('/get-ginner-summary-report', fetchGinnerSummaryPagination);
router.get('/export-ginner-summary-report', exportGinnerSummary);
router.get('/get-ginner-cotton-stock-report', fetchGinnerCottonStock);
router.get('/export-ginner-cotton-stock-report', exportGinnerCottonStock);
router.get('/get-spinner-cotton-stock-report', fetchSpinnerLintCottonStock);
router.get('/export-spinner-cotton-stock-report', exportSpinnerCottonStock);
router.get('/get-garment-fabric-receipt-report', fetchGarmentFabricReceipt);
router.get('/export-garment-fabric-receipt-report', exportGarmentFabricReceipt);
router.get('/get-garment-sales-filters', getGarmentSalesFilter);
router.get('/get-garment-sales-report', fetchGarmentSalesPagination);
router.get('/export-garment-sales-report', exportGarmentSales);
router.get('/get-garment-fabric-process-report', fetchGarmentFabricProcess);
router.get('/export-garment-fabric-process-report', exportGarmentFabricProcess);
router.get('/get-pscp-precurement-report', fetchPscpPrecurement);
router.get('/get-ginner-pscp-precurement-report', fetchPscpGinnerPrecurement);
router.get('/get-pscp-precurement-live-tracker-report', fetchPscpProcurementLiveTracker);
router.get('/export-pscp-precurement-live-tracker-report', exportPscpProcurementLiveTracker);

router.get('/export-pscp-precurement-report', exportPscpCottonProcurement);
router.get('/export-ginner-pscp-precurement-report', exportPscpGinnerCottonProcurement);
router.get('/get-consolidated-report', consolidatedTraceability);
router.get('/export-consolidated-report', exportConsolidatedTraceability);

router.get('/get-spinner-traceability-report', spinnerBackwardTraceabiltyReport);
router.get('/export-spinner-traceability-report', exportSpinnerBackwardTraceability);

router.get('/get-village-seed-cotton-report', villageSeedCottonReport);
router.get('/export-village-seed-cotton-report', exportVillageSeedCotton);

export default router;  