import {
    countCottonBaleWithProgram,
    createKnitterrSales,
    fetchKnitterDashBoard,
    updateStatusKnitterSale,
    fetchKnitterSalesPagination,
    exportKnitterSale,
    getProgram,
    getSpinnerAndProgram,
    getInvoiceAndyarnType,
    deleteKnitterSales
} from "../../controllers/knitter";

import { Router } from "express";
const router = Router();

router.get('/', fetchKnitterSalesPagination);
router.post('/', createKnitterrSales);
router.delete('/', deleteKnitterSales);
router.get('/export', exportKnitterSale);
router.get('/transaction', fetchKnitterDashBoard);
router.put('/transaction', updateStatusKnitterSale);
router.get('/transaction/count', countCottonBaleWithProgram);
router.get('/get-program', getProgram);
router.get('/get-spinner-trans', getSpinnerAndProgram);
router.get('/get-invoice-trans', getInvoiceAndyarnType);

export default router;