import * as Dashboard from "../../controllers/dashboard/spinner";


import { Router } from "express";
const router = Router();

router.get('/top/ginners', Dashboard.getTopGinners);
router.get('/lint/procured/processed', Dashboard.getLintProcuredProcessed);
router.get('/yarn/procured/sold', Dashboard.getYarnProcuredSold);
router.get('/data/get/all', Dashboard.getDataAll);

export default router;