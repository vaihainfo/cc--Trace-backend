import {
    organicCottonOverview,
    fetchBrandTransactionsPagination
} from "../../controllers/brand";


import { Router } from "express";
const router = Router();

// Ginner Routes
router.get('/organic-cotton-overview', organicCottonOverview);
router.get('/transactions', fetchBrandTransactionsPagination);



export default router;