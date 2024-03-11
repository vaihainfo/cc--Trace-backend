import {
    fetchCottonMixPagination,
    checkCottonMixs,
    createCottonMix,
    createCottonMixes,
    updateCottonMix,
    updateCottonMixStatus,
    deleteCottonMix
} from "../../controllers/cotton-mix";
import accessControl from "../../middleware/access-control";
import { Router } from "express";
const router = Router();

router.use(accessControl);

// Cottonmix Routes
router.get('/', fetchCottonMixPagination);
router.post('/check-cotton-mixs', checkCottonMixs);
router.post('/', createCottonMix);
router.post('/multiple', createCottonMixes);
router.put('/', updateCottonMix);
router.put('/status', updateCottonMixStatus);
router.delete('/', deleteCottonMix);


export default router;