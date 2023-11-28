import {
    fetchDyingTransactions,
    fetchDyingTransactionsAll,
    fetchWashingTransactionsAll,
    updateTransactionStatus,
    chooseDyingFabric,
    createDyingProcess,
    fetchDyingSalesPagination,
    getProgram,
    getFabrics,
    getGarments,
    exportDyingProcess,
    updateWashingTransactionStatus,
    createWashingProcess,
    fetchWashingSalesPagination,
    exportWashingProcess,
    chooseWashingFabric,
    fetchPrintingTransactions,
    fetchPrintingTransactionSold,
    updatePrintingTransactionStatus,
    createPrintingProcess,
    fetchPrintingSalesPagination,
    exportPrintingProcess,
    choosePrintingFabric
} from "../../controllers/fabric";

import { Router } from "express";

const router = Router();

router.get('/dying-dashboard', fetchDyingTransactions);
router.get('/dying-dashboard-all', fetchDyingTransactionsAll);
router.get('/washing-dashboard-all', fetchWashingTransactionsAll);
router.put('/update-transaction', updateTransactionStatus);
router.get('/choose-dying-fabric', chooseDyingFabric);
router.post('/dying-process', createDyingProcess);
router.get('/export-dying-process', exportDyingProcess);
router.get('/dying-process', fetchDyingSalesPagination);
router.get('/get-program', getProgram);
router.get('/get-fabrics', getFabrics);
router.get('/get-garments', getGarments);
router.put('/update-transaction-washing', updateWashingTransactionStatus);
router.get('/choose-washing-fabric', chooseWashingFabric);
router.post('/washing-process', createWashingProcess);
router.get('/export-washing-process', exportWashingProcess);
router.get('/washing-process', fetchWashingSalesPagination);
router.get('/printing-dashboard-all', fetchPrintingTransactions);
router.get('/printing-dashboard', fetchPrintingTransactionSold);
router.put('/update-transaction-printing', updatePrintingTransactionStatus);
router.get('/choose-printing-fabric', choosePrintingFabric);
router.post('/printing-process', createPrintingProcess);
router.get('/printing-process', fetchPrintingSalesPagination);
router.get('/export-printing-process', exportPrintingProcess);

export default router;