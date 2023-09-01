import {
    createVideoName,
    fetchVideoNamePagination,
    updateVideoName,
    updateVideoNameStatus,
    deleteVideoName
} from "../../controllers/video";

import { Router } from "express";
const router = Router();

// Video Routes
router.get('/', fetchVideoNamePagination);
router.post('/', createVideoName);
router.put('/', updateVideoName);
router.put('/status', updateVideoNameStatus);
router.delete('/', deleteVideoName);


export default router;