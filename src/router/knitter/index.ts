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
    deleteKnitterSales,
    getGarments,
    fetchKnitterSale,
    getFabrics,
    createKnitterProcess,
    fetchKnitterProcessPagination,
    fetchFabricReelLotNo,
    exportKnitterProcess
} from "../../controllers/knitter";

import { Router } from "express";
const router = Router();

router.post('/process', createKnitterProcess);
router.get('/process', fetchKnitterProcessPagination);
router.get('/', fetchKnitterSalesPagination);
router.get('/get-sale', fetchKnitterSale);
router.post('/', createKnitterrSales);
router.delete('/', deleteKnitterSales);
router.get('/export', exportKnitterSale);
router.get('/export-process', exportKnitterProcess);
router.get('/transaction', fetchKnitterDashBoard);
router.put('/transaction', updateStatusKnitterSale);
router.get('/transaction/count', countCottonBaleWithProgram);
router.get('/get-program', getProgram);
router.get('/get-spinner-trans', getSpinnerAndProgram);
router.get('/get-invoice-trans', getInvoiceAndyarnType);
router.get('/get-garments', getGarments);
router.get('/get-fabrics', getFabrics);
router.get('/get-reel-lot-no', fetchFabricReelLotNo);

export default router;