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
    getChooseFabricFilters,
    fetchGarmentSale,
    getBrands,
    createGarmentProcess,
    fetchGarmentProcessPagination,
    chooseFabricProcess,
    chooseGarmentSales,
    getGarmentReelLotNo,
    getChooseGarmentFilters,
    exportGarmentProcess,
    getBuyerProcessors,
    garmentTraceabilityMap,
    updateGarmentProcess,
    fetchGarmentProcess,
    updateGarmentSales
} from "../../controllers/garment-sales";

import { Router } from "express";
const router = Router();

// Garment Sales Routes
// router.get('/brand', fetchBrandQrGarmentSalesPagination);
// router.post('/export-brand', exportBrandQrGarmentSales);
router.get('/dashboard', fetchTransactions);
router.get('/dashboard-all', fetchTransactionsAll);
router.post('/update-transaction', updateTransactionStatus);
router.post('/process', createGarmentProcess);
router.put('/process', updateGarmentProcess);
router.get('/process/get-process', fetchGarmentProcess);
router.get('/process', fetchGarmentProcessPagination);
router.get('/choose-fabric', chooseFabricProcess);
router.get('/choose-garment', chooseGarmentSales);
router.post('/', createGarmentSales);
router.put('/', updateGarmentSales);
router.get('/', fetchGarmentSalesPagination);
router.get('/export', exportGarmentSale);
router.get('/export-process', exportGarmentProcess);
router.get('/embroidering', getEmbroidering);
router.get('/get-program', getProgram);
router.get('/dashboard/garph', dashboardGraph);
router.get('/get-processor', getprocessName);
router.get('/get-batch-lot', getChooseFabricFilters);
router.get('/get-sale', fetchGarmentSale);
router.get('/get-brand', getBrands);
router.get('/get-reel-lot-no', getGarmentReelLotNo);
router.get('/get-choose-garment-filter', getChooseGarmentFilters);
router.get('/get-buyer-processors', getBuyerProcessors);
router.get('/get-map-tracebility', garmentTraceabilityMap);

export default router;