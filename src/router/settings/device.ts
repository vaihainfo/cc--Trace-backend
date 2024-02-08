import {
    createDevice,
    fetchDevicePagination,
    updateDevice,
    updateDeviceStatus,
    deleteDevice
} from "../../controllers/device";
import accessControl from "../../middleware/access-control";
import { Router } from "express";
const router = Router();

router.use(accessControl);

// Device Routes
router.get('/', fetchDevicePagination);
router.post('/', createDevice);
router.put('/', updateDevice);
router.put('/status', updateDeviceStatus);
router.delete('/', deleteDevice);


export default router;  