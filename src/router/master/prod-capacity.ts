import {
    fetchProdCapacityPagination,
    checkProdCapacities,
    createProdCapacity,
    createProdCapacities,
    updateProdCapacity,
    updateProdCapacityStatus,
    deleteProdCapacity
} from "../../controllers/production-capacity";

import { Router } from "express";
import accessControl from "../../middleware/access-control";
const router = Router();

router.use(accessControl);

// Production Capacity Routes
router.get('/', fetchProdCapacityPagination);
router.post('/check-prod-capacities', checkProdCapacities);
router.post('/', createProdCapacity);
router.post('/multiple', createProdCapacities);
router.put('/', updateProdCapacity);
router.put('/status', updateProdCapacityStatus);
router.delete('/', deleteProdCapacity);


export default router;