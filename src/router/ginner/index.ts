import { exportGinnerProcurement } from "../../controllers/procurement";
import {
    fetchGinBale,
    fetchGinProcessPagination,
    createGinnerProcess,
    createGinnerSales,
    fetchGinSalesPagination,
    exportGinnerProcess,
    updateGinnerSales,
    exportGinnerSales,
    fetchGinSaleBale,
    chooseCotton,
    updateTransactionStatus,
    dashboardGraphWithProgram,
    getReelBaleId,
    fetchGinSale,
    getProgram,
    updateGinSaleBale,
    chooseBale,
    deleteGinnerProcess,
    getSpinner,
    getVillageAndFarmer,
    deleteGinSales,
    getGinnerProcessTracingChartData,
    updateGinnerProcess,
    updateGinnerSalesField,
    fetchGinProcess,
    checkReport
} from "../../controllers/ginner";
import accessControl from "../../middleware/access-control";
import { Router } from "express";

const router = Router();

router.use(accessControl);

// Ginner Routes
router.get('/', fetchGinProcessPagination);
router.post('/', createGinnerProcess);
router.put('/', updateGinnerProcess);
router.get('/get-gin-process', fetchGinProcess);
router.get('/export', exportGinnerProcess);
router.delete('/', deleteGinnerProcess);
router.get('/choose-cotton', chooseCotton);
router.get('/fetch-bale', fetchGinBale);
router.get('/', fetchGinProcessPagination);
router.post('/sales', createGinnerSales);
router.get('/sales', fetchGinSalesPagination);
router.get('/sales/get-gin-sale', fetchGinSale);
router.put('/sales', updateGinnerSales);
router.put('/sales/update', updateGinnerSalesField);
router.delete('/sales', deleteGinSales);
router.get('/sales/export', exportGinnerSales);
router.get('/sales/bale', fetchGinSaleBale);
// router.post('/sales/spinner', createSpinnerProcess);
router.put('/update-status-transaction', updateTransactionStatus);
router.get('/dashboard', dashboardGraphWithProgram);
router.get('/reel', getReelBaleId);
router.get('/get-program', getProgram);
router.put('/sales/update-bale', updateGinSaleBale);
router.get('/sales/choose-bale', chooseBale);
router.get('/get-spinner', getSpinner);
router.get('/get-village-farmer', getVillageAndFarmer);
router.get('/export-ginner-transactions', exportGinnerProcurement);
router.get('/tracing/chart', getGinnerProcessTracingChartData);
router.get('/check-report', checkReport);

export default router;