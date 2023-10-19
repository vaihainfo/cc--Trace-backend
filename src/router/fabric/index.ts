import {
    fetchDyingTransactions,
    fetchDyingTransactionsAll,
    fetchWashingTransactions,
    fetchWashingTransactionsAll,
    updateTransactionStatus
} from "@controllers/fabric";

import { Router } from "express";

const router = Router();

router.get('/dying-dashboard', fetchDyingTransactions);
router.get('/dying-dashboard-all', fetchDyingTransactionsAll);
router.get('/washing-dashboard', fetchWashingTransactions);
router.get('/washing-dashboard-all', fetchWashingTransactionsAll);
router.post('/update-transaction', updateTransactionStatus);

export default router;