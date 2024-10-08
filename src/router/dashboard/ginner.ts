import * as Dashboard from "../../controllers/dashboard/ginner";
import accessControl from "../../middleware/access-control";
import { Router } from "express";


const router = Router();
router.use(accessControl);
router.get('/top/village', Dashboard.getTopVillages);
router.get('/top/spinners', Dashboard.getTopSpinners);
router.get('/procured/processed', Dashboard.getProcuredProcessed);
router.get('/lint/procured/sold', Dashboard.getLintProcuredSold);
router.get('/data/get/all', Dashboard.getDataAll);
router.get('/bale/produced/sold/stock', Dashboard.getBaleComparison);
router.get('/lint/processed/top/ginners', Dashboard.getLintProcessedTopGinners);
router.get('/lint/sold/top/ginners', Dashboard.getLintSoldTopGinners);
router.get('/lint/stock/top/ginners', Dashboard.getLintStockTopGinners);
router.get('/lint/processed/by/country', Dashboard.getLintProcessedByCountry);
router.get('/lint/sold/by/country', Dashboard.getLintSoldByCountry);
router.get('/average/outturn/by/country', Dashboard.getCountryGinnerArea);
router.get('/procured/allocated', Dashboard.getProcuredAllocated);
router.get('/cotton/procured/by/country', Dashboard.getProcuredByCountry);
router.get('/cotton/processed/by/country', Dashboard.getProcessedByCountry);
router.get('/bales/procured/by/country', Dashboard.getBalesProcuredByCountry);
router.get('/bales/sold/by/country', Dashboard.getBalesSoldByCountry);
router.get('/bales/stock/by/country', Dashboard.getBalesStockByCountry);

router.get('/greyout/lint/stock', Dashboard.getGinGreyoutQtyStock);
router.get('/greyout/bale/stock', Dashboard.getGinGreyoutBaleStock);

export default router;