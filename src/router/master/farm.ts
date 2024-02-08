import {
    createFarmProduct,
    createFarmProducts,
    deleteFarmProduct,
    fetchFarmProductPagination,
    updateFarmProduct,
    updateFarmProductStatus
} from "../../controllers/farm/farm-product";
import {
    createFarm,
    createFarms,
    deleteFarm,
    fetchFarmsPagination,
    updateFarm,
    updateFarmStatus
} from "../../controllers/farm/farm-item";
import { Router } from "express";
import accessControl from "../../middleware/access-control";
const router = Router();

router.use(accessControl);

// Farm Item Routes
router.get('/farm-item', fetchFarmsPagination);
router.post('/farm-item', createFarm);
router.post('/farm-item-multiple', createFarms);
router.put('/farm-item', updateFarm);
router.put('/farm-item-status', updateFarmStatus);
router.delete('/farm-item', deleteFarm);



// Farm Product Routes
router.get('/farm-product', fetchFarmProductPagination);
router.post('/farm-product', createFarmProduct);
router.post('/farm-product-multiple', createFarmProducts);
router.put('/farm-product', updateFarmProduct);
router.put('/farm-product-status', updateFarmProductStatus);
router.delete('/farm-product', deleteFarmProduct);


export default router;