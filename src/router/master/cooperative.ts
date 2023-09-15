import {
    createCooperative,
    fetchCooperativePagination,
    updateCooperative,
    updateCooperativeStatus,
    deleteCooperative
} from "../../controllers/cooperative";

import { Router } from "express";
const router = Router();

// Cooperative Routes
router.get('/', fetchCooperativePagination);
router.post('/', createCooperative);
router.put('/', updateCooperative);
router.put('/status', updateCooperativeStatus);
router.delete('/', deleteCooperative);


export default router;