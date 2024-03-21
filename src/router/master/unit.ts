import {
    createUnitCertification,
    checkUnitCertifications,
    createUnitCertifications,
    deleteUnitCertification,
    fetchUnitCertificationPagination,
    updateUnitCertification,
    updateUnitCertificationStatus
} from "../../controllers/units/unit-certification";
import {
    createUnitSubType,
    checkUnitSubTypes,
    createUnitSubTypes,
    deleteUnitSubType,
    fetchUnitSubTypePagination,
    updateUnitSubType,
    updateUnitSubTypeStatus
} from "../../controllers/units/unit-subtype";

import {
    createUnitType,
    checkUnitTypes,
    createUnitTypes,
    deleteUnitType,
    fetchUnitTypePagination,
    updateUnitType,
    updateUnitTypeStatus
} from "../../controllers/units/unit-type";
import accessControl from "../../middleware/access-control";
import { Router } from "express";
const router = Router();

router.use(accessControl);

// Unit Type Routes
router.get('/unit-type', fetchUnitTypePagination);
router.post('/check-unit-type', checkUnitTypes);
router.post('/unit-type', createUnitType);
router.post('/unit-type-multiple', createUnitTypes);
router.put('/unit-type', updateUnitType);
router.put('/unit-type-status', updateUnitTypeStatus);
router.delete('/unit-type', deleteUnitType);

// Unit Sub Type Routes
router.get('/unit-sub-type', fetchUnitSubTypePagination);
router.post('/check-sub-type', checkUnitSubTypes);
router.post('/unit-sub-type', createUnitSubType);
router.post('/unit-sub-type-multiple', createUnitSubTypes);
router.put('/unit-sub-type', updateUnitSubType);
router.put('/unit-sub-type-status', updateUnitSubTypeStatus);
router.delete('/unit-sub-type', deleteUnitSubType);

// Unit Sub Type Routes
router.get('/unit-certification', fetchUnitCertificationPagination);
router.post('/check-unit-certification', checkUnitCertifications);
router.post('/unit-certification', createUnitCertification);
router.post('/unit-certification-multiple', createUnitCertifications);
router.put('/unit-certification', updateUnitCertification);
router.put('/unit-certification-status', updateUnitCertificationStatus);
router.delete('/unit-certification', deleteUnitCertification);

export default router;