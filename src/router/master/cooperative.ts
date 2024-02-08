import {
    createCooperative,
    fetchCooperativePagination,
    updateCooperative,
    updateCooperativeStatus,
    deleteCooperative
} from "../../controllers/cooperative";
import accessControl from "../../middleware/access-control";
import { Router } from "express";
const router = Router();

router.use(accessControl)

// Cooperative Routes
router.get('/', fetchCooperativePagination);
router.post('/', createCooperative);
router.put('/', updateCooperative);
router.put('/status', updateCooperativeStatus);
router.delete('/', deleteCooperative);


export default router;