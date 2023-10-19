import {
    organicCottonOverview,
    fetchBrandTransactionsPagination,
    productionUpdate
} from "../../controllers/brand";


import { Router } from "express";
const router = Router();

// Ginner Routes
router.get('/organic-cotton-overview', organicCottonOverview);
router.get('/transactions', fetchBrandTransactionsPagination);
router.get('/production-update', productionUpdate);



export default router;