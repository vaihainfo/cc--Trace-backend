import { Router } from "express";
import accessControl from "../../middleware/access-control";
import {
    fetchPhysicalPartnerPagination,
    fetchPhysicalPartner,
    deletePhysicalPartner,
    checkPhysicalPartner,
    getPhysicalPartnerBrand
} from "../../controllers/process-registration/physical-partner";

const router = Router();

// router.use(accessControl);

router.get('/', fetchPhysicalPartnerPagination);
router.get('/get/physicalPartner/brand', getPhysicalPartnerBrand);
router.get('/get-physical-partner', fetchPhysicalPartner);
router.delete('/', deletePhysicalPartner);
router.post('/check-physical-partner', checkPhysicalPartner);

export default router;