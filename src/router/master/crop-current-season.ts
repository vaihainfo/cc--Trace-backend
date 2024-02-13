import {
    createCropCurrentSeason,
    createCropCurrentSeasons,
    deleteCropCurrentSeason,
    fetchCropCurrentSeasonPagination,
    updateCropCurrentSeason
} from "../../controllers/crop-current-season";
import accessControl from "../../middleware/access-control";
import { Router } from "express";

const router = Router();

router.use(accessControl);

// crop-current-season Routes
router.get('/', fetchCropCurrentSeasonPagination);
router.post('/', createCropCurrentSeason);
router.post('/multiple', createCropCurrentSeasons);
router.put('/', updateCropCurrentSeason);
router.delete('/', deleteCropCurrentSeason);

export default router;