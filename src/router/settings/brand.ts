import {
    createBrand,
    fetchBrandPagination,
    deleteBrand,
    fetchBrandById,
    updateBrand,
    findUser,
    checkBrand,
    getProgram
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
router.get('/program/get', getProgram);

export default router;  