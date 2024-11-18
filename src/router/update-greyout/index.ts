import { updateGinProcessGreyoutStatusData, updateSpinProcessGreyoutStatusData, updateGinSalesGreyoutStatusData } from "../../controllers/update-greyout";
import accessControl from "../../middleware/access-control";
import { Router } from "express";

const router = Router();

router.use(accessControl);
router.post('/ginprocess', updateGinProcessGreyoutStatusData);
router.post('/spinprocess', updateSpinProcessGreyoutStatusData);
router.post('/ginsales', updateGinSalesGreyoutStatusData);

export default router;