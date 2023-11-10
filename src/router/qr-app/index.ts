
import { Router } from "express";
import accessControl from "../../middleware/access-control";
import { getRegisteredDevices, fetchAgentTransactions, getUnRegisteredDevices, getRegisteredOne, getUnRegisteredOne, agentLogin } from "../../controllers/qr-app";

const router = Router();

// router.use(accessControl)

router.get('/register-devices', getRegisteredDevices);
router.get('/unregister-devices', getUnRegisteredDevices);
router.get('/get-register-device', getRegisteredOne);
router.get('/get-unregister-device', getUnRegisteredOne);
router.get('/get-qr-transactions', fetchAgentTransactions);
router.post('/agent-login', agentLogin);

export default router;   