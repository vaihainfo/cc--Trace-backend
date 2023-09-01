import {
    createBrand,
    fetchBrandPagination,
    deleteBrand,
    fetchBrandById,
    updateBrand
} from "../../controllers/brand";

import { Router } from "express";
const router = Router();

// Scope Certificate Routes
router.get('/', fetchBrandPagination);
router.get('/:id', fetchBrandById);
router.post('/', createBrand);
router.put('/', updateBrand);
router.delete('/', deleteBrand);


export default router;  