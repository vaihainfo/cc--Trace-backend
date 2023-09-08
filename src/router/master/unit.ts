import {
    createUnitCertification,
    createUnitCertifications,
    deleteUnitCertification,
    fetchUnitCertificationPagination,
    updateUnitCertification,
    updateUnitCertificationStatus
} from "../../controllers/units/unit-certification";
import {
    createUnitSubType,
    createUnitSubTypes,
    deleteUnitSubType,
    fetchUnitSubTypePagination,
    updateUnitSubType,
    updateUnitSubTypeStatus
} from "../../controllers/units/unit-subtype";

import {
    createUnitType,
    createUnitTypes,
    deleteUnitType,
    fetchUnitTypePagination,
    updateUnitType,
    updateUnitTypeStatus
} from "../../controllers/units/unit-type";

import { Router } from "express";
import accessControl from "../../middleware/access-control";
const router = Router();

router.use(accessControl)

// Unit Type Routes
router.get('/unit-type', fetchUnitTypePagination);
router.post('/unit-type', createUnitType);
router.post('/unit-type-multiple', createUnitTypes);
router.put('/unit-type', updateUnitType);
router.put('/unit-type-status', updateUnitTypeStatus);
router.delete('/unit-type', deleteUnitType);

// Unit Sub Type Routes
router.get('/unit-sub-type', fetchUnitSubTypePagination);
router.post('/unit-sub-type', createUnitSubType);
router.post('/unit-sub-type-multiple', createUnitSubTypes);
router.put('/unit-sub-type', updateUnitSubType);
router.put('/unit-sub-type-status', updateUnitSubTypeStatus);
router.delete('/unit-sub-type', deleteUnitSubType);

// Unit Sub Type Routes
router.get('/unit-certification', fetchUnitCertificationPagination);
router.post('/unit-certification', createUnitCertification);
router.post('/unit-certification-multiple', createUnitCertifications);
router.put('/unit-certification', updateUnitCertification);
router.put('/unit-certification-status', updateUnitCertificationStatus);
router.delete('/unit-certification', deleteUnitCertification);

export default router;