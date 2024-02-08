import {
    createFarmGroup,
    createFarmGroups,
    fetchFarmGroupPagination,
    updateFarmGroup,
    updateFarmGroupStatus,
    deleteFarmGroup
} from "../../controllers/farm-group";
import accessControl from "../../middleware/access-control";
import { Router } from "express";
const router = Router();

router.use(accessControl);

// Farm Group Routes
router.get('/', fetchFarmGroupPagination);
router.post('/', createFarmGroup);
router.post('/multiple', createFarmGroups);
router.put('/', updateFarmGroup);
router.put('/status', updateFarmGroupStatus);
router.delete('/', deleteFarmGroup);


export default router;