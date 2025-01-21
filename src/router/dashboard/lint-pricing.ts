import * as Dashboard from "../../controllers/dashboard/lint-pricing";
import accessControl from "../../middleware/access-control";
import { Router } from "express";

const router = Router();
router.use(accessControl);

router.get('/pricing/lint/by/country', Dashboard.getPricyByCountry);
router.get('/pricing/lint/by/state', Dashboard.getPricyByState);

export default router;