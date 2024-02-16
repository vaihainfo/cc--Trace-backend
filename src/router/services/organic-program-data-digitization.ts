import {
    fetchSeedAvailabilityPagination,
    updateSeedAvailability,
    deleteSeedAvailability,
    fetchSeedAvailability
} from "../../controllers/organic-program-data-digitization/seed-availability";

import { Router } from "express";

const router = Router();

// seed-availability routes
router.get("/seed-availability", fetchSeedAvailabilityPagination);
router.get("/seed-availability/:id", fetchSeedAvailability);
router.put("/seed-availability", updateSeedAvailability);
router.delete("/seed-availability", deleteSeedAvailability);

export default router;