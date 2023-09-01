import {
    fetchProdCapacityPagination,
    createProdCapacity,
    createProdCapacities,
    updateProdCapacity,
    updateProdCapacityStatus,
    deleteProdCapacity
} from "../../controllers/production-capacity";

import { Router } from "express";
const router = Router();

// Production Capacity Routes
router.get('/', fetchProdCapacityPagination);
router.post('/', createProdCapacity);
router.post('/multiple', createProdCapacities);
router.put('/', updateProdCapacity);
router.put('/status', updateProdCapacityStatus);
router.delete('/', deleteProdCapacity);


export default router;