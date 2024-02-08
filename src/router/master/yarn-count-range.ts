import {
    fetchYarnCountPagination,
    createYarnCount,
    createYarnCounts,
    updateYarnCount,
    updateYarnCountStatus,
    deleteYarnCount
} from "../../controllers/yarn-count-range";
import accessControl from "../../middleware/access-control";
import { Router } from "express";
const router = Router();

router.use(accessControl);

// Yarn Count Routes
router.get('/', fetchYarnCountPagination);
router.post('/', createYarnCount);
router.post('/multiple', createYarnCounts);
router.put('/', updateYarnCount);
router.put('/status', updateYarnCountStatus);
router.delete('/', deleteYarnCount);


export default router;