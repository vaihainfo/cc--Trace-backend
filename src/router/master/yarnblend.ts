import { fetchYarnBlendPagination, createYarnBlend, updateYarnBlend, updateYarnBlendStatus, deleteYarnBlend, exportYarnBlend } from "../../controllers/yarn-blend";
import accessControl from "../../middleware/access-control";
import { Router } from "express";
const router = Router();

router.use(accessControl);

router.get('/', fetchYarnBlendPagination);
router.post('/', createYarnBlend);
router.put('/', updateYarnBlend);
router.put('/status', updateYarnBlendStatus);
router.delete('/', deleteYarnBlend);
router.get('/export', exportYarnBlend);


export default router;