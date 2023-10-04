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
    fetchComberNoilPagination
} from "../../controllers/spinner";

import { Router } from "express";
const router = Router();

// Spinner Routes
router.get('/', fetchSpinnerProcessPagination);
router.post('/', createSpinnerProcess);
router.put('/', updateSpinnerProcess);
router.get('/export', exportSpinnerProcess);
router.get('/sales', fetchSpinSalesPagination);
router.get('/comber-noil', fetchComberNoilPagination);
router.post('/sales', createSpinnerSales);
router.get('/sales/export', exportSpinnerSale);
router.get('/transaction', fetchSpinSalesDashBoard);
router.put('/transaction', updateStatusSales);
router.get('/transaction/count', countCottonBaleWithProgram);
router.get('/transaction/export', exportSpinnerTransaction);
router.get('/get-program', getProgram);
export default router;