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
import accessControl from "../../middleware/access-control";
import { Router } from "express";
const router = Router();

router.use(accessControl);

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