import * as Dashboard from "../../controllers/dashboard/processor";


import { Router } from "express";
const router = Router();

router.get('/knitter/yarn', Dashboard.getKnitterYarn);
router.get('/knitter/fabric', Dashboard.getKnitterFabric);
router.get('/weaver/yarn', Dashboard.getWeaverYarn);
router.get('/weaver/fabric', Dashboard.getWeaverFabric);
router.get('/garment/fabric', Dashboard.getGarmentFabric);
router.get('/garment/inventory', Dashboard.getGarmentInventory);

export default router;