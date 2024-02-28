import * as Dashboard from "../../controllers/dashboard/spinner";


import { Router } from "express";
const router = Router();

router.get('/top/ginners', Dashboard.getTopGinners);
router.get('/procured/processed', Dashboard.getProcuredProcessed);
router.get('/lint/procured/sold', Dashboard.getLintProcuredSold);
router.get('/data/get/all', Dashboard.getDataAll);

export default router;