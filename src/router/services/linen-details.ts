

import { createLinenDetails, exportLinenTransactions, fetchSumOfWeightBylinen, fetchlinenDetails } from "../../controllers/linen-details";
import { Router } from "express";
const router = Router();

// Farmer & farm Routes
router.get('/get-linens', fetchlinenDetails);
router.get('/get-total-weight-linens', fetchSumOfWeightBylinen);
router.post('/upload-bulk-linens', createLinenDetails);
router.get('/export-bulk-linens', exportLinenTransactions);

// router.put('/', updateFarmer);
// router.delete('/', deleteFarmer);
// router.get('/farm', fetchFarmPagination);
// router.post('/farm', createFarmerFarm);
// router.put('/farm', updateFarmerFarm);
// router.get('/farm/count', countFarmWithProgram);


export default router;  