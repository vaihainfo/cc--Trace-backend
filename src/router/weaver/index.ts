import {
    countCottonBaleWithProgram,
    fetchWeaverDashBoard,
    updateStatusWeaverSale,
    fetchWeaverSalesPagination,
    createWeaverSales,
    exportWeaverSale,
    deleteWeaverSales,
    getWeaverProgram,
    getSpinnerAndProgram,
    getInvoiceAndyarnType,
} from "../../controllers/weaver";

import { Router } from "express";
const router = Router();

router.get('/', fetchWeaverSalesPagination);
router.post('/', createWeaverSales);
router.delete('/', deleteWeaverSales);
router.get('/get-program', getWeaverProgram);
router.get('/export', exportWeaverSale);
router.get('/transaction', fetchWeaverDashBoard);
router.put('/transaction', updateStatusWeaverSale);
router.get('/transaction/count', countCottonBaleWithProgram);
router.get('/get-spinner-trans', getSpinnerAndProgram);
router.get('/get-invoice-trans', getInvoiceAndyarnType);
export default router;