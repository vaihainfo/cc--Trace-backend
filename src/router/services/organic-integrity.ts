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
router.get("/", fetchOrganicIntegrityPagination);
router.post("/", createOrganicIntegrity);
router.put("/", updateOrganicIntegrity);
router.delete("/", deleteOrganicIntegrity);
router.get("/get-organic-integrity", fetchOrganicIntegrity);

export default router;
