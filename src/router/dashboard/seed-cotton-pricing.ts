import * as Dashboard from "../../controllers/dashboard/seed-coton-pricing";
import accessControl from "../../middleware/access-control";
import { Router } from "express";



const router = Router();
router.use(accessControl);

router.get('/pricing/seed-cotton/by/country', Dashboard.getPricyByCountry);
router.get('/pricing/seed-cotton/by/state', Dashboard.getPricyByStates);

export default router;