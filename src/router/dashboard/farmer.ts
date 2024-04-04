import * as Dashboard from "../../controllers/dashboard/farmer";
import accessControl from "../../middleware/access-control";
import { Router } from "express";

const router = Router();

router.use(accessControl);

router.get('/area/overall', Dashboard.getOverallArea);
router.get('/overall', Dashboard.getOverallFarmer);
router.get('/count', Dashboard.getFarmerCount);
router.get('/acre', Dashboard.getTotalAcres);
router.get('/estimate/production/count', Dashboard.getEstimateAndProduction);
router.get('/count/area', Dashboard.farmerCountAndArea);
router.get('/data/all', Dashboard.farmerAllData);
router.get('/by/country', Dashboard.getFarmersByCountry)

export default router;