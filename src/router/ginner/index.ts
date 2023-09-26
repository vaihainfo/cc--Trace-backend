import {
    fetchGinBale,
    fetchGinProcessPagination,
    createGinnerProcess,
    createGinnerSales,
    fetchGinSalesPagination,
    updateGinnerSales,
    exportGinnerSales,
    fetchGinSaleBale,
    chooseCotton,
    updateTransactionStatus,
    dashboardGraphWithProgram,
    getReelBaleId
} from "../../controllers/ginner";
import {

    createSpinnerProcess,
} from "../../controllers/spinner";

import { Router } from "express";
const router = Router();

// Ginner Routes
router.get('/', fetchGinProcessPagination);
router.post('/', createGinnerProcess);
router.get('/choose-cotton', chooseCotton);
router.get('/fetch-bale', fetchGinBale);
router.get('/', fetchGinProcessPagination);
router.post('/sales', createGinnerSales);
router.get('/sales', fetchGinSalesPagination);
router.put('/sales', updateGinnerSales);
router.get('/sales/export', exportGinnerSales);
router.get('/sales/bale', fetchGinSaleBale);
router.post('/sales/spinner', createSpinnerProcess);
router.put('/update-status-transaction', updateTransactionStatus);
router.get('/dashboard', dashboardGraphWithProgram);
router.get('/reel', getReelBaleId);


export default router;