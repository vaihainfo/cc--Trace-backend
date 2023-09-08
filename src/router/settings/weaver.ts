import {
    createWeaver,
    fetchWeaverPagination,
    updateWeaver,
    deleteWeaver,
    fetchWeaver
} from "../../controllers/process-registration/weaver";

import { Router } from "express";
const router = Router();

// Scope Certificate Routes
router.get('/', fetchWeaverPagination);
router.get('/get-weaver', fetchWeaver);
router.post('/', createWeaver);
router.put('/', updateWeaver);
router.delete('/', deleteWeaver);


export default router;  