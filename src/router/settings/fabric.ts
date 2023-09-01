import { createFabric, deleteFabric, fetchFabricPagination, updateFabric } from "../../controllers/process-registration/fabric";

import { Router } from "express";
const router = Router();

router.get('/get-fabrics', fetchFabricPagination);
router.post('/set-fabric', createFabric);
router.put('/update-fabric', updateFabric);
router.delete('/delete-fabric', deleteFabric);


export default router;  