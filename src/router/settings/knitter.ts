import {
    createKnitter,
    fetchKnitterPagination,
    updateKnitter,
    deleteKnitter
} from "../../controllers/process-registration/knitter";

import { Router } from "express";
const router = Router();

// Scope Certificate Routes
router.get('/', fetchKnitterPagination);
router.post('/', createKnitter);
router.put('/', updateKnitter);
router.delete('/', deleteKnitter);


export default router;  