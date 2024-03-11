import {
    fetchSeasonPagination,
    createSeason,
    checkSeasons,
    updateSeason,
    updateSeasonStatus,
    deleteSeason
} from "../../controllers/season";
import accessControl from "../../middleware/access-control";
import { Router } from "express";
const router = Router();

router.use(accessControl);

// Season Routes
router.get('/', fetchSeasonPagination);
router.post('/check-seasons', checkSeasons);
router.post('/', createSeason);
router.put('/', updateSeason);
router.put('/status', updateSeasonStatus);
router.delete('/', deleteSeason);


export default router;