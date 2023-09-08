import {
    fetchSeasonPagination,
    createSeason,
    updateSeason,
    updateSeasonStatus,
    deleteSeason
} from "../../controllers/season";

import { Router } from "express";
import accessControl from "../../middleware/access-control";
const router = Router();

router.use(accessControl)
// Season Routes
router.get('/', fetchSeasonPagination);
router.post('/', createSeason);
router.put('/', updateSeason);
router.put('/status', updateSeasonStatus);
router.delete('/', deleteSeason);


export default router;