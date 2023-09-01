import {
    createValidationFarmer,
    fetchValidationFarmerPagination,
    deleteValidationFarmer
} from "../../controllers/validations-farmer";

import {
    createValidationProject,
    fetchValidationProjectPagination,
    deleteValidationProject,
    fetchValidation
} from "../../controllers/validation-project";

import { Router } from "express";
const router = Router();

// Farmer Premium Validation
router.get('/farmer', fetchValidationFarmerPagination);
router.post('/farmer', createValidationFarmer);
router.delete('/farmer', deleteValidationFarmer);

// Project Premium Validation
router.get('/project', fetchValidationProjectPagination);
router.post('/project', createValidationProject);
router.delete('/project', deleteValidationProject);
router.get('/get-project', fetchValidation);

export default router;  