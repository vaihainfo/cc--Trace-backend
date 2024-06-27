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

router.get('/by/country', Dashboard.getFarmersByCountry);
router.get('/count/by/country', Dashboard.getCountryFarmerCount);
router.get('/area/by/country', Dashboard.getCountryFarmerArea);
router.get('/estimate/by/country', Dashboard.getEstimateCottonByCountry);
router.get('/production/by/country', Dashboard.getCountryFarmerArea);
export default router;