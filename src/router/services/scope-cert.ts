import {
    createScopeCert,
    fetchScopeCertPagination,
    deleteScopeCert,
    updateScopeCert,
    fetchScopeCert
} from "../../controllers/scope-certificate";

import { Router } from "express";
const router = Router();

// Scope Certificate Routes
router.get('/', fetchScopeCertPagination);
router.get('/:id', fetchScopeCert);
router.post('/', createScopeCert);
router.put('/', updateScopeCert);
router.delete('/', deleteScopeCert);


export default router;  