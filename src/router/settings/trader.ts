import {
    createTrader,
    updateTrader,
    deleteTrader,
    fetchTraderPagination
} from "../../controllers/process-registration/trader";

import { Router } from "express";
const router = Router();

// Scope Certificate Routes
router.get('/', fetchTraderPagination);
router.post('/', createTrader);
router.put('/', updateTrader);
router.delete('/', deleteTrader);


export default router;  