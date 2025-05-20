import { Router } from "express";
import {
    fetchConsolidatedDetailsGinnerSpinnerPagination,
    exportConsolidatedDetailsGinnerSpinner,
    fetchSpinnerDetailsPagination,
    exportSpinnerDetails
} from "../../controllers/master-sheet";
import accessControl from "../../middleware/access-control";

const router = Router();

// router.use(accessControl);

// Master Sheet Route
router.get('/get-consolidated-ginner-spinner', fetchConsolidatedDetailsGinnerSpinnerPagination);
router.get('/export-consolidated-ginner-spinner', exportConsolidatedDetailsGinnerSpinner);
router.get('/get-spinner-details-sheet', fetchSpinnerDetailsPagination);
router.get('/export-spinner-details', exportSpinnerDetails);

export default router;