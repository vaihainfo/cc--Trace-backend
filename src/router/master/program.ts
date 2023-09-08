import {
    fetchProgramPagination,
    createProgram,
    createPrograms,
    updateProgram,
    updateProgramStatus,
    deleteProgram
} from "../../controllers/program";

import { Router } from "express";
import accessControl from "../../middleware/access-control";
const router = Router();

router.use(accessControl)

// Department Routes
router.get('/', fetchProgramPagination);
router.post('/', createProgram);
router.post('/multiple', createPrograms);
router.put('/', updateProgram);
router.put('/status', updateProgramStatus);
router.delete('/', deleteProgram);


export default router;