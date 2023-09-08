import { Router } from "express";
const router = Router();
import {
    createCrop,
    createCrops,
    deleteCrop,
    fetchCropsPagination,
    updateCrop,
    updateCropStatus
} from "../../controllers/crop/crop-name";

import {
    createCropType,
    createCropTypes,
    deleteCropType,
    fetchCropTypePagination,
    updateCropType,
    updateCropTypeStatus
} from "../../controllers/crop/crop-type";

import {
    createCropVarieties,
    createCropVariety,
    deleteCropVariety,
    fetchCropVarietyPagination,
    updateCropVariety,
    updateCropVarietyStatus
} from "../../controllers/crop/crop-variety";

import {
    createCropGrade,
    createCropGrades,
    deleteCropGrade,
    fetchCropGradePagination,
    updateCropGrade,
    updateCropGradeStatus
} from "../../controllers/crop/crop-grade";
import accessControl from "../../middleware/access-control";

router.use(accessControl)

// Crop Name Routes
router.get('/crop-name', fetchCropsPagination);
router.post('/crop-name', createCrop);
router.post('/crop-name-multiple', createCrops);
router.put('/crop-name', updateCrop);
router.put('/crop-name-status', updateCropStatus);
router.delete('/crop-name', deleteCrop);

// Crop Type Routes
router.get('/crop-type', fetchCropTypePagination);
router.post('/crop-type', createCropType);
router.post('/crop-type-multiple', createCropTypes);
router.put('/crop-type', updateCropType);
router.put('/crop-type-status', updateCropTypeStatus);
router.delete('/crop-type', deleteCropType);


// Crop Variety Routes
router.get('/crop-variety', fetchCropVarietyPagination);
router.post('/crop-variety', createCropVariety);
router.post('/crop-variety-multiple', createCropVarieties);
router.put('/crop-variety', updateCropVariety);
router.put('/crop-variety-status', updateCropVarietyStatus);
router.delete('/crop-variety', deleteCropVariety);

// Crop Grade Routes
router.get('/crop-grade', fetchCropGradePagination);
router.post('/crop-grade', createCropGrade);
router.post('/crop-grade-multiple', createCropGrades);
router.put('/crop-grade', updateCropGrade);
router.put('/crop-grade-status', updateCropGradeStatus);
router.delete('/crop-grade', deleteCropGrade);

export default router;