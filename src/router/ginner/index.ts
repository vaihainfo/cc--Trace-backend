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
    getReelBaleId,
    fetchGinSale,
    getProgram,
    updateGinSaleBale,
    chooseBale,
    deleteGinnerProcess
} from "../../controllers/ginner";


import { Router } from "express";
const router = Router();

// Ginner Routes
router.get('/', fetchGinProcessPagination);
router.post('/', createGinnerProcess);
router.delete('/', deleteGinnerProcess);
router.get('/choose-cotton', chooseCotton);
router.get('/fetch-bale', fetchGinBale);
router.get('/', fetchGinProcessPagination);
router.post('/sales', createGinnerSales);
router.get('/sales', fetchGinSalesPagination);
router.get('/sales/get-gin-sale', fetchGinSale);
router.put('/sales', updateGinnerSales);
router.get('/sales/export', exportGinnerSales);
router.get('/sales/bale', fetchGinSaleBale);
// router.post('/sales/spinner', createSpinnerProcess);
router.put('/update-status-transaction', updateTransactionStatus);
router.get('/dashboard', dashboardGraphWithProgram);
router.get('/reel', getReelBaleId);
router.get('/get-program', getProgram);
router.put('/sales/update-bale', updateGinSaleBale);
router.get('/sales/choose-bale', chooseBale);



export default router;