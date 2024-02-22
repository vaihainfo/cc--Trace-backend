import {
    createSeedTestingLinkage,
    fetchSeedTestingLinkagePagination,
    fetchSeedTestingLinkage,
    updateSeedTestingLinkage,
    deleteSeedTestingLinkage,
    deleteSeedTestingLinkageReport
} from "../../controllers/organic-program-data-digitization/seed-testing-linkage";
import {
    fetchSeedDemandPagination,
    fetchSeedDemand,
    updateSeedDemand,
    deleteSeedDemand
} from "../../controllers/organic-program-data-digitization/seed-demand";
import {
    fetchSeedAvailabilityPagination,
    fetchSeedAvailability,
    updateSeedAvailability,
    deleteSeedAvailability
} from "../../controllers/organic-program-data-digitization/seed-availability";

import { Router } from "express";

const router = Router();

// seed-testing-linkage routes
router.post("/seed-testing-linkage", createSeedTestingLinkage);
router.get("/seed-testing-linkage", fetchSeedTestingLinkagePagination);
router.get("/seed-testing-linkage/:id", fetchSeedTestingLinkage);
router.put("/seed-testing-linkage", updateSeedTestingLinkage);
router.delete("/seed-testing-linkage", deleteSeedTestingLinkage);
router.delete("/seed-testing-linkage-report", deleteSeedTestingLinkageReport);

// seed-demand routes
router.get("/seed-demand", fetchSeedDemandPagination);
router.get("/seed-demand/:id", fetchSeedDemand);
router.put("/seed-demand", updateSeedDemand);
router.delete("/seed-demand", deleteSeedDemand);

// seed-availability routes
router.get("/seed-availability", fetchSeedAvailabilityPagination);
router.get("/seed-availability/:id", fetchSeedAvailability);
router.put("/seed-availability", updateSeedAvailability);
router.delete("/seed-availability", deleteSeedAvailability);

export default router;