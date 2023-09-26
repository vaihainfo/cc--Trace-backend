import {
    countCottonBaleWithProgram,
    createKnitterrSales,
    fetchKnitterDashBoard,
    updateStatusKnitterSale,
    fetchKnitterSalesPagination,
    exportKnitterSale

} from "../../controllers/knitter";

import { Router } from "express";
const router = Router();

router.get('/', fetchKnitterSalesPagination);
router.post('/', createKnitterrSales);
router.get('/export', exportKnitterSale);
router.get('/transaction', fetchKnitterDashBoard);
router.put('/transaction', updateStatusKnitterSale);
router.get('/transaction/count', countCottonBaleWithProgram);

export default router;