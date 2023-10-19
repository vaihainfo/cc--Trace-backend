import { checkFabric, createFabric, deleteFabric, fetchFabric, fetchFabricPagination, updateFabric } from "../../controllers/process-registration/fabric";

import { Router } from "express";
const router = Router();

router.get('/', fetchFabricPagination);
router.get('/get-fabric', fetchFabric);
router.post('/', createFabric);
router.put('/', updateFabric);
router.delete('/', deleteFabric);
router.post('/check-fabric', checkFabric);

export default router;  