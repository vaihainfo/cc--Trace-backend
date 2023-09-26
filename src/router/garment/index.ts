import {
    fetchBrandQrGarmentSalesPagination,
    exportBrandQrGarmentSales,
    fetchTransactions,
    fetchTransactionsAll,
    updateTransactionStatus
} from "../../controllers/garment-sales";

import { Router } from "express";
const router = Router();

// Garment Sales Routes
router.get('/brand', fetchBrandQrGarmentSalesPagination);
router.post('/export-brand', exportBrandQrGarmentSales);
router.get('/dashboard', fetchTransactions);
router.get('/dashboard-all', fetchTransactionsAll);
router.post('/update-transaction', updateTransactionStatus);
export default router;