import {
    createKnitter,
    fetchKnitterPagination,
    updateKnitter,
    deleteKnitter,
    fetchKnitter,
    checkKnitter
} from "../../controllers/process-registration/knitter";

import { Router } from "express";
const router = Router();

// Scope Certificate Routes
router.get('/', fetchKnitterPagination);
router.get('/get-knitter', fetchKnitter);
router.post('/', createKnitter);
router.put('/', updateKnitter);
router.delete('/', deleteKnitter);
router.post('/check-knitter', checkKnitter);

export default router;  