import {
    fetchGinBale,
    fetchGinProcessPagination,
    createGinnerProcess,
    createGinnerSales,
    fetchGinSalesPagination,
    updateGinnerSales,
    exportGinnerSales,
    fetchGinSaleBale
} from "../../controllers/ginner";
import {

    createSpinnerProcess,
} from "../../controllers/spinner";

import { Router } from "express";
const router = Router();

// Ginner Routes
router.get('/', fetchGinProcessPagination);
router.post('/', createGinnerProcess);
router.get('/fetch-bale', fetchGinBale);
router.get('/', fetchGinProcessPagination);
router.post('/sales', createGinnerSales);
router.get('/sales', fetchGinSalesPagination);
router.put('/sales', updateGinnerSales);
router.get('/sales/export', exportGinnerSales);
router.get('/sales/bale', fetchGinSaleBale);
router.post('/sales/spinner', createSpinnerProcess);
export default router;