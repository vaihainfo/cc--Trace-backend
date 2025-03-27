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
    exportKnitterProcess,
    getChooseFabricFilters,
    chooseFabricProcess,
    getKnitterProcessTracingChartData,
    updateKnitterProcess,
    updateKnitterrSales,
    fetchKnitterProcess,
    exportKnitterTransactionList
} from "../../controllers/knitter";
import accessControl from "../../middleware/access-control";
import { Router } from "express";

const router = Router();

router.use(accessControl);

router.post('/process', createKnitterProcess);
router.put('/process', updateKnitterProcess);
router.get('/process/get-process', fetchKnitterProcess);
router.get('/process', fetchKnitterProcessPagination);
router.get('/', fetchKnitterSalesPagination);
router.get('/get-sale', fetchKnitterSale);
router.post('/', createKnitterrSales);
router.put('/', updateKnitterrSales);
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
router.get('/get-fabric-filters', getChooseFabricFilters);
router.get('/choose-fabric', chooseFabricProcess);
router.get('/tracing/chart', getKnitterProcessTracingChartData);
router.get('/export/transaction', exportKnitterTransactionList);

export default router;