import * as Dashboard from "../../controllers/dashboard/spinner";
import accessControl from "../../middleware/access-control";
import { Router } from "express";


const router = Router();
router.use(accessControl);
router.get('/top/ginners', Dashboard.getTopGinners);
router.get('/top/fabric', Dashboard.getTopFabric);
router.get('/lint/procured/processed', Dashboard.getLintProcuredProcessed);
router.get('/yarn/procured/sold', Dashboard.getYarnProcuredSold);
router.get('/data/get/all', Dashboard.getDataAll);

export default router;