import {
    fetchProgramPagination,
    createProgram,
    createPrograms,
    updateProgram,
    updateProgramStatus,
    deleteProgram
} from "../../controllers/program";
import accessControl from "../../middleware/access-control";
import { Router } from "express";
const router = Router();

router.use(accessControl);

// Department Routes
router.get('/', fetchProgramPagination);
router.post('/', createProgram);
router.post('/multiple', createPrograms);
router.put('/', updateProgram);
router.put('/status', updateProgramStatus);
router.delete('/', deleteProgram);


export default router;