import {
    createTrader,
    updateTrader,
    deleteTrader,
    fetchTraderPagination,
    fetchTrader,
    checkTrader
} from "../../controllers/process-registration/trader";
import accessControl from "../../middleware/access-control";
import { Router } from "express";
const router = Router();

router.use(accessControl);

// Scope Certificate Routes
router.get('/', fetchTraderPagination);
router.get('/get-trader', fetchTrader);
router.post('/', createTrader);
router.put('/', updateTrader);
router.delete('/', deleteTrader);
router.post('/check-trader', checkTrader);

export default router;  