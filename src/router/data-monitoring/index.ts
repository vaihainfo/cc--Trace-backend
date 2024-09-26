

import { 
    fetchDataMonitorGinnerPagination, 
    fetchDataMonitorSpinnerPagination,
    fetchDataMonitorKnitterPagination,
    fetchDataMonitorWeaverPagination,
    fetchDataMonitorGarmentPagination,
    exportDataMonitorGinnerPagination,
    exportDataMonitorSpinnerPagination,
    exportDataMonitorKnitterPagination,
    exportDataMonitorWeaverPagination,
    exportDataMonitorGarmentPagination
 } from "../../controllers/data-monitoring";
import { Router } from "express";
const router = Router();

// Upload databases Routes
router.get('/ginner', fetchDataMonitorGinnerPagination)
router.get('/spinner', fetchDataMonitorSpinnerPagination)
router.get('/knitter', fetchDataMonitorKnitterPagination)
router.get('/weaver', fetchDataMonitorWeaverPagination)
router.get('/garment', fetchDataMonitorGarmentPagination)

router.get('/export/ginner', exportDataMonitorGinnerPagination)
router.get('/export/spinner', exportDataMonitorSpinnerPagination)
router.get('/export/knitter', exportDataMonitorKnitterPagination)
router.get('/export/weaver', exportDataMonitorWeaverPagination)
router.get('/export/garment', exportDataMonitorGarmentPagination)



export default router;  