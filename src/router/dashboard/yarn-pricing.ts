import * as Dashboard from "../../controllers/dashboard/yarn-pricing";
import accessControl from "../../middleware/access-control";
import { Router } from "express";



const router = Router();
router.use(accessControl);

router.get('/pricing/yarn/by/country', Dashboard.getPricyByCountry);
router.get('/pricing/yarn/by/state', Dashboard.getPricyByState);

export default router;