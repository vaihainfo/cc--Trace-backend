import { Router } from "express";
import {
    exportLoad,
    fetchConsolidatedDetailsGinnerSpinnerPagination,
    exportConsolidatedDetailsGinnerSpinner,
    fetchSpinnerDetailsPagination,
    exportSpinnerDetails,
    fetchConsolidatedDetailsFarmerGinnerPagination,
    exportConsolidatedDetailsFarmerGinner,
    fetchGinnerDetailsPagination,
    exportGinnerDetails,
    fetchSummarySheetPagination
} from "../../controllers/master-sheet";
import accessControl from "../../middleware/access-control";

const router = Router();

// router.use(accessControl);

// Master Sheet Route
router.get('/get-consolidated-ginner-spinner', fetchConsolidatedDetailsGinnerSpinnerPagination);
router.get('/export-consolidated-ginner-spinner', exportConsolidatedDetailsGinnerSpinner);
router.get('/get-spinner-details-sheet', fetchSpinnerDetailsPagination);
router.get('/export-spinner-details', exportSpinnerDetails);
router.get('/get-consolidated-farmer-ginner', fetchConsolidatedDetailsFarmerGinnerPagination);
router.get('/export-consolidated-farmer-ginner', exportConsolidatedDetailsFarmerGinner);
router.get('/get-ginner-details-sheet', fetchGinnerDetailsPagination);
router.get('/export-ginner-details-sheet', exportGinnerDetails);
router.post("/check-export-load", exportLoad);

router.get('/get-summary-sheet', fetchSummarySheetPagination);

export default router;