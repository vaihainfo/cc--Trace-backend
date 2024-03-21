import { checkFabric, createFabric, deleteFabric, fetchFabric, fetchFabricPagination, updateFabric } from "../../controllers/process-registration/fabric";
import accessControl from "../../middleware/access-control";
import { Router } from "express";
const router = Router();

router.use(accessControl);

router.get('/', fetchFabricPagination);
router.get('/get-fabric', fetchFabric);
router.post('/', createFabric);
router.put('/', updateFabric);
router.delete('/', deleteFabric);
router.post('/check-fabric', checkFabric);

export default router;  