import * as Dashboard from "../../controllers/dashboard/spinner";
import accessControl from "../../middleware/access-control";
import { Router } from "express";


const router = Router();
router.use(accessControl);
router.get('/top/ginners', Dashboard.getTopGinners);
router.get('/top/fabric', Dashboard.getTopFabric);
router.get('/lint/procured/processed', Dashboard.getLintProcuredProcessed);
router.get('/yarn/procured/sold', Dashboard.getYarnProcuredSold);
router.get('/data/get/all', Dashboard.getDataAll);
router.get('/top/yarn/count', Dashboard.getTopYarnCount);
router.get('/yarn/type', Dashboard.getYarnType);
router.get('/yarn/processed/stock', Dashboard.getYarnProcessedStock);
router.get('/top/yarn/processed', Dashboard.getTopYarnProcessed);
router.get('/top/yarn/sold', Dashboard.getTopYarnSold);
router.get('/top/yarn/stock', Dashboard.getTopYarnStock);
router.get('/lint/processed/by/country', Dashboard.getLintProcessedByCountry);
router.get('/lint/sold/by/country', Dashboard.getLintSoldByCountry);
router.get('/yarn/processed/by/country', Dashboard.getYarnProcessedByCountry);
router.get('/yarn/sold/by/country', Dashboard.getYarnSoldByCountry);
router.get('/yarn/produced/by/country', Dashboard.getYarnProducedByCountry);
router.get('/yarn/stock/by/country', Dashboard.getYarnStockByCountry);

export default router;