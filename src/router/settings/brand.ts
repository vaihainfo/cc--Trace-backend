import {
    createBrand,
    fetchBrandPagination,
    deleteBrand,
    fetchBrandById,
    updateBrand,
    findUser,
    checkBrand
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
router.post('/check-brand', checkBrand);
export default router;  