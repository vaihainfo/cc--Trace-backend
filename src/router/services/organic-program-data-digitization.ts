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