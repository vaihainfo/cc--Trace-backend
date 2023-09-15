import {
    createBrand,
    fetchBrandPagination,
    deleteBrand,
    fetchBrandById,
    updateBrand,
    findUser
} from "../../controllers/brand";

import { Router } from "express";
const router = Router();

// Scope Certificate Routes
router.get('/', fetchBrandPagination);
router.get('/:id', fetchBrandById);
router.post('/', createBrand);
router.put('/', updateBrand);
router.delete('/', deleteBrand);
router.post('/user', findUser);

export default router;  