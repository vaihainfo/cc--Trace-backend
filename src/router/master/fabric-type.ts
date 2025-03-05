import {
    fetchFebricTypePagination,
    checkFabricTypes,
    createFabricType,
    createFabricTypes,
    updateFebricType,
    updateFebricTypeStatus,
    deleteFebricType
} from "../../controllers/fabric-type";
import accessControl from "../../middleware/access-control";
import { Router } from "express";
const router = Router();

router.use(accessControl);

// Fabric Type Routes
router.get('/', fetchFebricTypePagination);
router.post('/check-fabric-types', checkFabricTypes);
router.post('/', createFabricType);
router.post('/multiple', createFabricTypes);
router.put('/', updateFebricType);
router.put('/status', updateFebricTypeStatus);
router.delete('/', deleteFebricType);


export default router;