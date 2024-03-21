import {
    fetchTraderTransactions,
    getProgram,
    updateTransactionStatus,
    createTraderSales,
    fetchTraderSalesPagination
} from "../../controllers/trader";

import { Router } from "express";
const router = Router();

// Trader Inferface Routes
router.post('/update-transaction', updateTransactionStatus);
router.post('/', createTraderSales);
router.get('/', fetchTraderSalesPagination);
// router.post('/export', exportGarmentSale);
// router.get('/embroidering', getEmbroidering);
router.get('/get-program', getProgram);
router.get('/transaction', fetchTraderTransactions);


export default router;