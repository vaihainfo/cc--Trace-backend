import {
    organicCottonOverview,
    fetchBrandTransactionsPagination,
    productionUpdate,
    productTracebility,
    styleMarkNo,
    getProgram,
    getCountries,
    updateStatusBrandSale
} from "../../controllers/brand";


import { Router } from "express";
const router = Router();

// Ginner Routes
router.get('/organic-cotton-overview', organicCottonOverview);
router.get('/transactions', fetchBrandTransactionsPagination);
router.put('/update-transaction', updateStatusBrandSale);
router.get('/production-update', productionUpdate);
router.get('/product-tracebility', productTracebility);
router.get('/style-mark', styleMarkNo);
router.get('/get-countries', getCountries);
router.get('/get-program', getProgram);

export default router;