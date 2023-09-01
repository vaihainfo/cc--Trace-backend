import {
    fetchLoomTypePagination,
    createLoomType,
    createLoomTypes,
    updateLoomType,
    updateLoomTypeStatus,
    deleteLoomType
} from "../../controllers/loom-type";

import { Router } from "express";
const router = Router();

// Loom Type Routes
router.get('/', fetchLoomTypePagination);
router.post('/', createLoomType);
router.post('/multiple', createLoomTypes);
router.put('/', updateLoomType);
router.put('/status', updateLoomTypeStatus);
router.delete('/', deleteLoomType);


export default router;