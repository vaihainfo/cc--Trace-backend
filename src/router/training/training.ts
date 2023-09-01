
import { createTraining, deleteTraining, fetchTraining, fetchTrainings, updateTraining, updateTrainingStatus } from "../../controllers/training";
import { Router } from "express";
import accessControl from "middleware/access-control";

const router = Router();

// router.use(accessControl)

router.get('/get-trainings', fetchTrainings);
router.get('/get-training', fetchTraining);

router.post('/set-training', createTraining);
router.put('/update-training', updateTraining);
router.put('/update-training-status', updateTrainingStatus);

router.delete('/delete-training', deleteTraining);


export default router;  