import * as Dashboard from "../../controllers/dashboard/fabric";
import accessControl from "../../middleware/access-control";
import { Router } from "express";

const router = Router();

router.use(accessControl);

router.get('/fabric/compare/data', Dashboard.getFabricCompareData);
router.get('/top/fabric/procured', Dashboard.getTopProcured);
router.get('/top/fabric/sold', Dashboard.getTopSold);

export default router;