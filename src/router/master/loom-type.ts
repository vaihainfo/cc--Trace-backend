import {
    fetchLoomTypePagination,
    checkLoomTypes,
    createLoomType,
    createLoomTypes,
    updateLoomType,
    updateLoomTypeStatus,
    deleteLoomType
} from "../../controllers/loom-type";
import accessControl from "../../middleware/access-control";
import { Router } from "express";
const router = Router();

router.use(accessControl)

// Loom Type Routes
router.get('/', fetchLoomTypePagination);
router.post('/check-loom-types', checkLoomTypes);
router.post('/', createLoomType);
router.post('/multiple', createLoomTypes);
router.put('/', updateLoomType);
router.put('/status', updateLoomTypeStatus);
router.delete('/', deleteLoomType);


export default router;