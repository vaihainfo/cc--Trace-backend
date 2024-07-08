import * as Dashboard from "../../controllers/dashboard/procurement";
import accessControl from "../../middleware/access-control";
import { Router } from "express";


const router = Router();
router.use(accessControl);
router.get('/country/estimate/production', Dashboard.getCountryEstimateAndProduction);
router.get('/estimated/procured', Dashboard.getEstimateAndProcured);
router.get('/estimated/procured/processed', Dashboard.getEstimateProcuredAndProduction);
router.get('/procured/processed', Dashboard.getProcuredProcessed);
router.get('/procured/processed/monthly', Dashboard.getProcuredProcessedMonthly);
router.get('/procured/by/country', Dashboard.getProcuredCottonByCountry);
router.get('/processed/by/country', Dashboard.getProcessedCottonByCountry);
router.get('/estimated/procured/processed/by/country', Dashboard.getProcessedEstimatedProcessedCottonByCountry);

export default router;