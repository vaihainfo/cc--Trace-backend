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
    getWeaverProcessTracingChartData
} from "../../controllers/weaver";

import { Router } from "express";
const router = Router();

router.post('/process', createWeaverProcess);
router.get('/process', fetchWeaverProcessPagination);
router.get('/', fetchWeaverSalesPagination);
router.post('/', createWeaverSales);
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

export default router;