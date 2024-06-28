import {
    countCottonBaleWithProgram,
    fetchWeaverDashBoard,
    updateStatusWeaverSale,
    fetchWeaverSalesPagination,
    createWeaverSales,
    exportWeaverSale,
    deleteWeaverSales,
    getWeaverProgram,
    getSpinnerTransaction,
    getInvoiceAndyarnType,
    getWeaverDyeing,
    getGarments,
    getFabrics,
    createWeaverProcess,
    fetchWeaverProcessPagination,
    fetchFabricReelLotNo,
    exportWeaverProcess,
    getChooseFabricFilters,
    fetchWeaverSale,
    chooseWeaverFabric,
    getWeaverProcessTracingChartData,
    updateWeaverProcess,
    fetchWeaverProcess,
    updateWeaverSales,
    getWeaverTransactionList
} from "../../controllers/weaver";
import accessControl from "../../middleware/access-control";
import { Router } from "express";

const router = Router();

router.use(accessControl);

router.post('/process', createWeaverProcess);
router.put('/process', updateWeaverProcess);
router.get('/process', fetchWeaverProcessPagination);
router.get('/process/get-process', fetchWeaverProcess);
router.get('/', fetchWeaverSalesPagination);
router.post('/', createWeaverSales);
router.put('/', updateWeaverSales);
router.delete('/', deleteWeaverSales);
router.get('/get-program', getWeaverProgram);
router.get('/export', exportWeaverSale);
router.get('/export-process', exportWeaverProcess);
router.get('/transaction', fetchWeaverDashBoard);
router.put('/transaction', updateStatusWeaverSale);
router.get('/transaction/count', countCottonBaleWithProgram);
router.get('/get-spinner-trans', getSpinnerTransaction);
router.get('/get-dyeing', getWeaverDyeing);
router.get('/get-garments', getGarments);
router.get('/get-sale', fetchWeaverSale);
router.get('/get-invoice-trans', getInvoiceAndyarnType);
router.get('/get-fabrics', getFabrics);
router.get('/get-reel-lot-no', fetchFabricReelLotNo);
router.get('/get-fabric-filters', getChooseFabricFilters);
router.get('/choose-fabric', chooseWeaverFabric);
router.get('/tracing/chart', getWeaverProcessTracingChartData);
router.get('/export/transaction', getWeaverTransactionList);

export default router;