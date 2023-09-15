import {
    fetchSeasonPagination,
    createSeason,
    updateSeason,
    updateSeasonStatus,
    deleteSeason
} from "../../controllers/season";

import { Router } from "express";
const router = Router();

// Season Routes
router.get('/', fetchSeasonPagination);
router.post('/', createSeason);
router.put('/', updateSeason);
router.put('/status', updateSeasonStatus);
router.delete('/', deleteSeason);


export default router;