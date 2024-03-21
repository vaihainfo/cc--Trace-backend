import * as Dashboard from "../../controllers/dashboard/ginner";
import accessControl from "../../middleware/access-control";
import { Router } from "express";


const router = Router();
router.use(accessControl);
router.get('/top/village', Dashboard.getTopVillages);
router.get('/top/spinners', Dashboard.getTopSpinners);
router.get('/procured/processed', Dashboard.getProcuredProcessed);
router.get('/lint/procured/sold', Dashboard.getLintProcuredSold);
router.get('/data/get/all', Dashboard.getDataAll);

export default router;