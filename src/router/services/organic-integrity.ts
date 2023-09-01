import {
    createOrganicIntegrity,
    fetchOrganicIntegrityPagination,
    updateOrganicIntegrity,
    deleteOrganicIntegrity,
    fetchOrganicIntegrity
} from "../../controllers/organic-integrity";

import { Router } from "express";
const router = Router();

// Organic integrity Routes
router.get('/', fetchOrganicIntegrityPagination);
router.get('/get-organic-integrity', fetchOrganicIntegrity);
router.post('/', createOrganicIntegrity);
router.put('/', updateOrganicIntegrity);
router.delete('/', deleteOrganicIntegrity);


export default router;  