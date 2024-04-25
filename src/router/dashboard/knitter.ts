import * as Dashboard from "../../controllers/dashboard/knitter";
import accessControl from "../../middleware/access-control";
import { Router } from "express";


const router = Router();
router.use(accessControl);

router.get('/yarn/compare/count', Dashboard.getYarnCompareCount);
router.get('/fabric/compare/count', Dashboard.getFabricCompareCount);
router.get('/fabric/yarn/month/data', Dashboard.getFabricYarnMonthlyData);
router.get('/top/yarn/procured', Dashboard.getTopYarnProcured);
router.get('/top/fabric/sold', Dashboard.getTopFabricSold);
router.get('/fabric/type', Dashboard.getFabricType);
router.get('/fabric/inventory', Dashboard.getFabricInventory);

export default router;