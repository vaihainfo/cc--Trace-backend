import {
    fetchCottonMixPagination,
    createCottonMix,
    createCottonMixes,
    updateCottonMix,
    updateCottonMixStatus,
    deleteCottonMix
} from "../../controllers/cotton-mix";

import { Router } from "express";
import accessControl from "../../middleware/access-control";
const router = Router();

router.use(accessControl)

// Cottonmix Routes
router.get('/', fetchCottonMixPagination);
router.post('/', createCottonMix);
router.post('/multiple', createCottonMixes);
router.put('/', updateCottonMix);
router.put('/status', updateCottonMixStatus);
router.delete('/', deleteCottonMix);


export default router;