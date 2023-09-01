import {
    createWeaver,
    fetchWeaverPagination,
    updateWeaver,
    deleteWeaver
} from "../../controllers/process-registration/weaver";

import { Router } from "express";
const router = Router();

// Scope Certificate Routes
router.get('/', fetchWeaverPagination);
router.post('/', createWeaver);
router.put('/', updateWeaver);
router.delete('/', deleteWeaver);


export default router;  