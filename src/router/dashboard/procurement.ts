import * as Dashboard from "../../controllers/dashboard/procurement";


import { Router } from "express";
const router = Router();

router.get('/country/estimate/production', Dashboard.getCountryEstimateAndProduction);
router.get('/estimated/procured', Dashboard.getEstimateAndProcured);
router.get('/estimated/procured/processed', Dashboard.getEstimateProcuredAndProcessed);
router.get('/procured/processed', Dashboard.getProcuredProcessed);
router.get('/procured/processed/monthly', Dashboard.getProcuredProcessedMonthly);

export default router;