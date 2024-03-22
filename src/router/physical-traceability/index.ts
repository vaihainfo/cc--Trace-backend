import { Router } from "express";
import accessControl from "../../middleware/access-control";

import {
    fetchPhysicalTraceabilityGinnerPagination,
    fetchPhysicalTraceabilityGinner,
    addPhysicalTraceabilityGinnerResults,
    fetchPhysicalTraceabilityGinnerSamplesPagination
} from "../../controllers/physical-traceability/ginner";
import {
    fetchPhysicalTraceabilitySpinnerPagination,
    fetchPhysicalTraceabilitySpinner,
    addPhysicalTraceabilitySpinnerResults,
    fetchPhysicalTraceabilitySpinnerSamplesPagination
} from "../../controllers/physical-traceability/spinner";
import {
    fetchPhysicalTraceabilityKnitterPagination,
    fetchPhysicalTraceabilityKnitter,
    addPhysicalTraceabilityKnitterResults,
    fetchPhysicalTraceabilityKnitterSamplesPagination
} from "../../controllers/physical-traceability/knitter";
import {
    fetchPhysicalTraceabilityWeaverPagination,
    fetchPhysicalTraceabilityWeaver,
    addPhysicalTraceabilityWeaverResults,
    fetchPhysicalTraceabilityWeaverSamplesPagination
} from "../../controllers/physical-traceability/weaver";
import {
    fetchPhysicalTraceabilityGarmentPagination,
    fetchPhysicalTraceabilityGarment,
    addPhysicalTraceabilityGarmentResults,
    fetchPhysicalTraceabilityGarmentSamplesPagination
} from "../../controllers/physical-traceability/garment";

const router = Router();

router.use(accessControl);

// physical-traceability-ginner routes
router.get('/ginner', fetchPhysicalTraceabilityGinnerPagination);
router.get('/ginner/:id', fetchPhysicalTraceabilityGinner);
router.post('/ginner/add-results', addPhysicalTraceabilityGinnerResults);
router.get('/ginner-samples', fetchPhysicalTraceabilityGinnerSamplesPagination);

// physical-traceability-spinner routes
router.get('/spinner', fetchPhysicalTraceabilitySpinnerPagination);
router.get('/spinner/:id', fetchPhysicalTraceabilitySpinner);
router.post('/spinner/add-results', addPhysicalTraceabilitySpinnerResults);
router.get('/spinner-samples', fetchPhysicalTraceabilitySpinnerSamplesPagination);

// physical-traceability-knitter routes
router.get('/knitter', fetchPhysicalTraceabilityKnitterPagination);
router.get('/knitter/:id', fetchPhysicalTraceabilityKnitter);
router.post('/knitter/add-results', addPhysicalTraceabilityKnitterResults);
router.get('/knitter-samples', fetchPhysicalTraceabilityKnitterSamplesPagination);

// physical-traceability-weaver routes
router.get('/weaver', fetchPhysicalTraceabilityWeaverPagination);
router.get('/weaver/:id', fetchPhysicalTraceabilityWeaver);
router.post('/weaver/add-results', addPhysicalTraceabilityWeaverResults);
router.get('/weaver-samples', fetchPhysicalTraceabilityWeaverSamplesPagination);

// physical-traceability-garment routes
router.get('/garment', fetchPhysicalTraceabilityGarmentPagination);
router.get('/garment/:id', fetchPhysicalTraceabilityGarment);
router.post('/garment/add-results', addPhysicalTraceabilityGarmentResults);
router.get('/garment-samples', fetchPhysicalTraceabilityGarmentSamplesPagination);

export default router;