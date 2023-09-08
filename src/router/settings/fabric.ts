import { createFabric, deleteFabric, fetchFabric, fetchFabricPagination, updateFabric } from "../../controllers/process-registration/fabric";

import { Router } from "express";
const router = Router();

router.get('/get-fabrics', fetchFabricPagination);
router.get('/get-fabric', fetchFabric);
router.post('/set-fabric', createFabric);
router.put('/update-fabric', updateFabric);
router.delete('/delete-fabric', deleteFabric);


export default router;  