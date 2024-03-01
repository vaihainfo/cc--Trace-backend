import {
    countCottonBaleWithProgram,
    createSpinnerProcess,
    createSpinnerSales,
    exportSpinnerProcess,
    exportSpinnerSale,
    fetchSpinSalesDashBoard,
    fetchSpinSalesPagination,
    fetchSpinnerProcessPagination,
    updateSpinnerProcess,
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
    getSpinnerProcessTracingChartData
} from "../../controllers/spinner";

import { Router } from "express";
const router = Router();

// Spinner Routes
router.get('/', fetchSpinnerProcessPagination);
router.post('/', createSpinnerProcess);
router.put('/', updateSpinnerProcess);
router.get('/get-process', fetchSpinnerProcess);
router.delete('/', deleteSpinnerProcess);
router.get('/export', exportSpinnerProcess);
router.get('/sales', fetchSpinSalesPagination);
router.delete('/sales', deleteSpinnerSales);
router.get('/comber-noil', fetchComberNoilPagination);
router.post('/sales', createSpinnerSales);
router.get('/sales/export', exportSpinnerSale);
router.get('/transaction', fetchSpinSalesDashBoard);
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

export default router;