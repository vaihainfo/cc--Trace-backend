import { checkFabric, createFabric, deleteFabric, fetchFabric, fetchFabricPagination, updateFabric } from "../../controllers/process-registration/fabric";

import { Router } from "express";
const router = Router();

router.get('/get-fabrics', fetchFabricPagination);
router.get('/get-fabric', fetchFabric);
router.post('/set-fabric', createFabric);
router.put('/update-fabric', updateFabric);
router.delete('/delete-fabric', deleteFabric);
router.post('/check-fabric', checkFabric);

export default router;  