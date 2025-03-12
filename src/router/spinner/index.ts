import {
    countCottonBaleWithProgram,
    createSpinnerProcess,
    createSpinnerSales,
    exportSpinnerProcess,
    exportSpinnerSale,
    fetchSpinSalesPagination,
    fetchSpinnerProcessPagination,
    updateStatusSales,
    exportSpinnerTransaction,
    getProgram,
    fetchComberNoilPagination,
    getYarnCount,
    deleteSpinnerProcess,
    deleteSpinnerSales,
    getKnitterWeaver,
    fetchSpinnerProcess,
    getGinnerDashboard,
    chooseLint,
    getSalesInvoice,
    chooseYarn,
    getInvoiceAndReelLotNo,
    getYarnReelLotNo,
    getSpinnerProcessTracingChartData,
    updateSpinProcess,
    updateSpinnerSales,
    fetchSpinnerSale,
    fetchTransactionList,
    fetchTransactionAlert,
    getSpinners,
    fetchTransactionAlertForComberNoil,
    updateStatusComberNoil,
    fetchComberNoilTransactionList,
    fetchComberNoilSoldList
} from "../../controllers/spinner";
import accessControl from "../../middleware/access-control";
import { Router } from "express";

const router = Router();

router.use(accessControl);


// Spinner Routes
router.get('/', fetchSpinnerProcessPagination);
router.post('/', createSpinnerProcess);
router.put('/', updateSpinProcess);
router.get('/get-process', fetchSpinnerProcess);
router.delete('/', deleteSpinnerProcess);
router.get('/export', exportSpinnerProcess);
router.get('/sales', fetchSpinSalesPagination);
router.put('/sales', updateSpinnerSales);
router.get('/sales/get-sale', fetchSpinnerSale);
router.delete('/sales', deleteSpinnerSales);
router.get('/comber-noil', fetchComberNoilPagination);
router.get('/get-spinner', getSpinners);
router.post('/sales', createSpinnerSales);
router.get('/sales/export', exportSpinnerSale);
router.get('/transaction-comber-noil', fetchTransactionAlertForComberNoil);
router.put('/transaction-comber-noil', updateStatusComberNoil);
router.get('/transaction-list-comber-noil', fetchComberNoilTransactionList);
router.get('/transaction', fetchTransactionAlert);
router.get('/transaction-list', fetchTransactionList);
router.put('/transaction', updateStatusSales);
router.get('/transaction/count', countCottonBaleWithProgram);
router.get('/transaction/export', exportSpinnerTransaction);
router.get('/get-program', getProgram);
router.get('/get-yarn', getYarnCount);
router.get('/get-knitter-weaver', getKnitterWeaver);
router.get('/get-filter-ginner', getGinnerDashboard);
router.get('/choose-lint', chooseLint);
router.get('/choose-yarn', chooseYarn);
router.get('/sales-invoice', getSalesInvoice);
router.get('/lint-invoice', getInvoiceAndReelLotNo);
router.get('/yarn-reel-lot', getYarnReelLotNo);
router.get('/tracing/chart', getSpinnerProcessTracingChartData);
router.get('/sold-list-comber-noil', fetchComberNoilSoldList);

export default router;