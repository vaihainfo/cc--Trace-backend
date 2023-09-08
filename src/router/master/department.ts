import {
    createDepartment,
    createDepartments,
    updateDepartment,
    updateDepartmentStatus,
    fetchDepartmentPagination,
    deleteDepartment
} from "../../controllers/department";

import { Router } from "express";
import accessControl from "../../middleware/access-control";
const router = Router();

router.use(accessControl)

// Department Routes
router.get('/', fetchDepartmentPagination);
router.post('/', createDepartment);
router.post('/multiple', createDepartments);
router.put('/', updateDepartment);
router.put('/status', updateDepartmentStatus);
router.delete('/', deleteDepartment);


export default router;