
import { Router } from "express";
import accessControl from "../../middleware/access-control";
import {
    getRegisteredDevices,
    fetchAgentTransactions, getUnRegisteredDevices, getRegisteredOne, getUnRegisteredOne, agentLogin, fetchQrDashboard,
    farmerByQrCode,
    createUserApp,
    updateUserApp,
    deleteUserApp,
    profile,
    findUser,
    fetchAgentList,
    exportAgentTransactions
} from "../../controllers/qr-app";

const router = Router();

// router.use(accessControl)

router.get('/register-devices', getRegisteredDevices);
router.get('/unregister-devices', getUnRegisteredDevices);
router.get('/get-register-device', getRegisteredOne);
router.get('/get-unregister-device', getUnRegisteredOne);
router.get('/get-qr-transactions', fetchAgentTransactions);
router.get('/export-qr-transactions', exportAgentTransactions);
router.post('/agent-login', agentLogin);
router.get('/user-profile', profile);
router.get('/qr-dashboard', fetchQrDashboard);
router.get('/farmer/QRcode', farmerByQrCode);
router.post('/create-user-app', createUserApp);
router.put('/update-user-app', updateUserApp);
router.delete('/delete-user-app', deleteUserApp);
router.post('/find-user', findUser);
router.get('/get-agent-list', fetchAgentList);

export default router;   