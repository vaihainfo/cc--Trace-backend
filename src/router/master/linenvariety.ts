import {
    fetchLinenPagination,
    createLinen,
    updateLinen,
    updateLinenStatus,
    deleteLinen
} from "../../controllers/linenvariety";

import { Router } from "express";
const router = Router();

// Linen Routes
router.get('/', fetchLinenPagination);
router.post('/', createLinen);
router.put('/', updateLinen);
router.put('/status', updateLinenStatus);
router.delete('/', deleteLinen);


export default router;