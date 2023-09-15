import {
    createDepartment,
    createDepartments,
    updateDepartment,
    updateDepartmentStatus,
    fetchDepartmentPagination,
    deleteDepartment
} from "../../controllers/department";

import { Router } from "express";
const router = Router();

// Department Routes
router.get('/', fetchDepartmentPagination);
router.post('/', createDepartment);
router.post('/multiple', createDepartments);
router.put('/', updateDepartment);
router.put('/status', updateDepartmentStatus);
router.delete('/', deleteDepartment);


export default router;