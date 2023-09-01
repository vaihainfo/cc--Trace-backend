

import { createLinenDetails, fetchlinenDetails } from "../../controllers/linen-details";
import { Router } from "express";
const router = Router();

// Farmer & farm Routes
router.get('/get-linens', fetchlinenDetails);
router.post('/set-linens', createLinenDetails);
// router.put('/', updateFarmer);
// router.delete('/', deleteFarmer);
// router.get('/farm', fetchFarmPagination);
// router.post('/farm', createFarmerFarm);
// router.put('/farm', updateFarmerFarm);
// router.get('/farm/count', countFarmWithProgram);


export default router;  