
import { createTraining, deleteTraining, exportTrainingStatus, fecthTrainingStatus, fecthTrainingStatusSpecific, fetchTraining, fetchTrainings, updateTraining, updateTrainingProcessStatus, updateTrainingStatus } from "../../controllers/training";
import { Router } from "express";
import accessControl from "../../middleware/access-control";

const router = Router();

router.use(accessControl)

router.get('/get-trainings', fetchTrainings);
router.get('/get-training', fetchTraining);

router.post('/set-training', createTraining);
router.put('/update-training', updateTraining);
router.put('/update-training-status', updateTrainingStatus);
router.get('/get-training-process-status', fecthTrainingStatus);
router.put('/update-training-process-status', updateTrainingProcessStatus);
router.get('/training-process-status', fecthTrainingStatusSpecific);
router.get('/export-training-process-status', exportTrainingStatus);
router.delete('/delete-training', deleteTraining);


export default router;  