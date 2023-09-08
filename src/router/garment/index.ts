import {
    fetchBrandQrGarmentSalesPagination,
    exportBrandQrGarmentSales
} from "../../controllers/garment-sales";

import { Router } from "express";
const router = Router();

// Garment Sales Routes
router.get('/brand', fetchBrandQrGarmentSalesPagination);
router.post('/export-brand', exportBrandQrGarmentSales);

export default router;