import {
    countCottonBaleWithProgram,
    fetchWeaverDashBoard,
    updateStatusWeaverSale,
    fetchWeaverSalesPagination,
    createWeaverSales,
    exportWeaverSale

} from "../../controllers/weaver";

import { Router } from "express";
const router = Router();

router.get('/', fetchWeaverSalesPagination);
router.post('/', createWeaverSales);
router.get('/export', exportWeaverSale);
router.get('/transaction', fetchWeaverDashBoard);
router.put('/transaction', updateStatusWeaverSale);
router.get('/transaction/count', countCottonBaleWithProgram);

export default router;