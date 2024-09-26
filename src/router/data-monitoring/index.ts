

import { 
    fetchDataMonitorGinnerPagination, 
    fetchDataMonitorSpinnerPagination,
    fetchDataMonitorKnitterPagination,
    fetchDataMonitorWeaverPagination,
    fetchDataMonitorGarmentPagination
 } from "../../controllers/data-monitoring";
import { Router } from "express";
const router = Router();

// Upload databases Routes
router.get('/ginner', fetchDataMonitorGinnerPagination)
router.get('/spinner', fetchDataMonitorSpinnerPagination)
router.get('/knitter', fetchDataMonitorKnitterPagination)
router.get('/weaver', fetchDataMonitorWeaverPagination)
router.get('/garment', fetchDataMonitorGarmentPagination)


export default router;  