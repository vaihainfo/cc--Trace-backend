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
    exportSpinnerTransaction
} from "../../controllers/spinner";

import { Router } from "express";
const router = Router();

// Spinner Routes
router.get('/', fetchSpinnerProcessPagination);
router.post('/', createSpinnerProcess);
router.put('/', updateSpinnerProcess);
router.get('/export', exportSpinnerProcess);
router.get('/sales', fetchSpinSalesPagination);
router.post('/sales', createSpinnerSales);
router.get('/sales/export', exportSpinnerSale);
router.get('/transaction', fetchSpinSalesDashBoard);
router.put('/transaction', updateStatusSales);
router.get('/transaction/count', countCottonBaleWithProgram);
router.get('/transaction/export', exportSpinnerTransaction);
export default router;