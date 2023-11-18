import {
    fetchBrandQrGarmentSalesPagination,
    exportBrandQrGarmentSales,
    fetchTransactions,
    fetchTransactionsAll,
    updateTransactionStatus,
    createGarmentSales,
    fetchGarmentSalesPagination,
    exportGarmentSale,
    getEmbroidering,
    getProgram,
    dashboardGraph,
    getprocessName,
    getInvoice,
    fetchGarmentSale,
    getBrands
} from "../../controllers/garment-sales";

import { Router } from "express";
const router = Router();

// Garment Sales Routes
// router.get('/brand', fetchBrandQrGarmentSalesPagination);
// router.post('/export-brand', exportBrandQrGarmentSales);
router.get('/dashboard', fetchTransactions);
router.get('/dashboard-all', fetchTransactionsAll);
router.post('/update-transaction', updateTransactionStatus);
router.post('/', createGarmentSales);
router.get('/', fetchGarmentSalesPagination);
router.get('/export', exportGarmentSale);
router.get('/embroidering', getEmbroidering);
router.get('/get-program', getProgram);
router.get('/dashboard/garph', dashboardGraph);
router.get('/get-processor', getprocessName);
router.get('/get-invoice', getInvoice);
router.get('/get-sale', fetchGarmentSale);
router.get('/get-brand', getBrands);

export default router;