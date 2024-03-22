import {
    createSeedCompanies,
    createSeedCompany,
    deleteSeedCompany,
    fetchSeedCompanyPagination,
    updateSeedCompany,
    updateSeedCompanyStatus
} from "../../controllers/seed-company";
import accessControl from "../../middleware/access-control";
import { Router } from "express";

const router = Router();

router.use(accessControl);

// seed-company Routes
router.get('/', fetchSeedCompanyPagination);
router.post('/', createSeedCompany);
router.post('/multiple', createSeedCompanies);
router.put('/', updateSeedCompany);
router.put('/status', updateSeedCompanyStatus);
router.delete('/', deleteSeedCompany);

export default router;