import {
    createWeaver,
    fetchWeaverPagination,
    updateWeaver,
    deleteWeaver,
    fetchWeaver,
    checkWeaver
} from "../../controllers/process-registration/weaver";

import { Router } from "express";
const router = Router();

// Scope Certificate Routes
router.get('/', fetchWeaverPagination);
router.get('/get-weaver', fetchWeaver);
router.post('/', createWeaver);
router.put('/', updateWeaver);
router.delete('/', deleteWeaver);
router.post('/check-weaver', checkWeaver);

export default router;  