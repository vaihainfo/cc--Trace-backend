import {
    createValidationFarmer,
    fetchValidationFarmerPagination,
    fetchValidationFarmer,
    deleteValidationFarmer,
    fetchPremiumFarmer
} from "../../controllers/validations-farmer";

import {
    createValidationProject,
    fetchValidationProjectPagination,
    deleteValidationProject,
    fetchValidation,
    fetchProcuredData
} from "../../controllers/validation-project";
import accessControl from "../../middleware/access-control";
import { Router } from "express";

const router = Router();

router.use(accessControl);
// Farmer Premium Validation
router.get('/farmer', fetchValidationFarmerPagination);
router.post('/farmer', createValidationFarmer);
router.delete('/farmer', deleteValidationFarmer);
router.get('/fetch-by-id', fetchValidationFarmer);
router.get('/get-premium-farmer', fetchPremiumFarmer);
// Project Premium Validation
router.get('/project', fetchValidationProjectPagination);
router.post('/project', createValidationProject);
router.delete('/project', deleteValidationProject);
router.get('/get-project', fetchValidation);
router.get('/project/get-procured-data', fetchProcuredData)

export default router;  