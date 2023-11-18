import {
    organicCottonOverview,
    fetchBrandTransactionsPagination,
    productionUpdate,
    productTracebility,
    styleMarkNo
} from "../../controllers/brand";


import { Router } from "express";
const router = Router();

// Ginner Routes
router.get('/organic-cotton-overview', organicCottonOverview);
router.get('/transactions', fetchBrandTransactionsPagination);
router.get('/production-update', productionUpdate);
router.get('/product-tracebility', productTracebility);
router.get('/style-mark', styleMarkNo);



export default router;