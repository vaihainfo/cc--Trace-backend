import {
    createDevice,
    fetchDevicePagination,
    updateDevice,
    updateDeviceStatus,
    deleteDevice
} from "../../controllers/device";

import { Router } from "express";
const router = Router();

// Device Routes
router.get('/', fetchDevicePagination);
router.post('/', createDevice);
router.put('/', updateDevice);
router.put('/status', updateDeviceStatus);
router.delete('/', deleteDevice);


export default router;  