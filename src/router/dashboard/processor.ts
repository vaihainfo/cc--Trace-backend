import * as Dashboard from "../../controllers/dashboard/processor";
import accessControl from "../../middleware/access-control";
import { Router } from "express";


const router = Router();
//router.use(accessControl);
router.get('/knitter/yarn', Dashboard.getKnitterYarn);
router.get('/knitter/fabric', Dashboard.getKnitterFabric);
router.get('/weaver/yarn', Dashboard.getWeaverYarn);
router.get('/weaver/fabric', Dashboard.getWeaverFabric);
router.get('/garment/fabric', Dashboard.getGarmentFabric);
router.get('/garment/inventory', Dashboard.getGarmentInventory);
router.get('/fabric/inventory', Dashboard.getFabricInventory);
router.get('/fabric', Dashboard.getFabricType);
router.get('/fabric/buyer/type', Dashboard.getFabricByBuyerType);

export default router;