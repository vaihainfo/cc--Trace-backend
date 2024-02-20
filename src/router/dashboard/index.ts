import * as Dashboard from "../../controllers/dashboard";


import { Router } from "express";
const router = Router();

// Ginner Routes
router.get('/area/overall', Dashboard.getOverallArea);

export default router;