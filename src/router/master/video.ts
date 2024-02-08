import {
    createVideoName,
    fetchVideoNamePagination,
    updateVideoName,
    updateVideoNameStatus,
    deleteVideoName
} from "../../controllers/video";
import accessControl from "../../middleware/access-control";
import { Router } from "express";
const router = Router();

router.use(accessControl);

// Video Routes
router.get('/', fetchVideoNamePagination);
router.post('/', createVideoName);
router.put('/', updateVideoName);
router.put('/status', updateVideoNameStatus);
router.delete('/', deleteVideoName);


export default router;