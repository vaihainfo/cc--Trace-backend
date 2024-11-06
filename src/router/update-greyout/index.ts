import { updateGinProcessGreyoutStatusData } from "../../controllers/update-greyout";
import accessControl from "../../middleware/access-control";
import { Router } from "express";

const router = Router();

router.use(accessControl);
router.post('/ginprocess', updateGinProcessGreyoutStatusData);

export default router;