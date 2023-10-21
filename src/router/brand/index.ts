import {
    organicCottonOverview,
    fetchBrandTransactionsPagination,
    productionUpdate,
    productTracebility
} from "../../controllers/brand";


import { Router } from "express";
const router = Router();

// Ginner Routes
router.get('/organic-cotton-overview', organicCottonOverview);
router.get('/transactions', fetchBrandTransactionsPagination);
router.get('/production-update', productionUpdate);
router.get('/product-tracebility', productTracebility);



export default router;