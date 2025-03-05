import * as Dashboard from "../../controllers/dashboard/garment";
import accessControl from "../../middleware/access-control";
import { Router } from "express";

const router = Router();

router.use(accessControl);

router.get('/fabric', Dashboard.getGarmentFabric);
router.get('/fabric/inventory', Dashboard.getGarmentInventory);
router.get('/fabric/compare', Dashboard.getFabricCompareCount);
router.get('/garment/compare', Dashboard.getGarmentCompareCount);
router.get('/fabric/garment/month/data', Dashboard.getFabricGarmentMonthlyData);
router.get('/top/fabric/procured', Dashboard.getTopProcured);
router.get('/top/sold', Dashboard.getTopSold);

export default router;