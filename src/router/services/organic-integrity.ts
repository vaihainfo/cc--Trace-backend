import {
    createOrganicIntegrity,
    fetchOrganicIntegrityPagination,
    updateOrganicIntegrity,
    deleteOrganicIntegrity,
    fetchOrganicIntegrity,
    updateReportOrganicIntegrity,
    deleteReportFromOrganicIntegrity
} from "../../controllers/organic-integrity";

import { Router } from "express";
const router = Router();

// Organic integrity Routes
router.get("/", fetchOrganicIntegrityPagination);
router.post("/", createOrganicIntegrity);
router.put("/", updateOrganicIntegrity);
router.delete("/", deleteOrganicIntegrity);
router.get("/get-organic-integrity", fetchOrganicIntegrity);
router.put("/upload-reports", updateReportOrganicIntegrity)
router.put("/delete-upload-reports", deleteReportFromOrganicIntegrity)

export default router;
