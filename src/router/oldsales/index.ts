import { Router } from "express";
import { fetchOldKnitterSales } from "../../controllers/oldsales/knitter";
import { fetchOldWeaverSales } from "../../controllers/oldsales/weaver";
import { fetchOldGarmentSales } from "../../controllers/oldsales/garment";
import { fetchOldCompactingSales, fetchOldDyeingSales, fetchOldPrintingSales, fetchOldWashingSales } from "../../controllers/oldsales/fabric";

const router = Router();

// knitter
router.get("/knitter-oldsales", fetchOldKnitterSales);

// weaver
router.get("/weaver-oldsales", fetchOldWeaverSales);

// garment
router.get("/garment-oldsales", fetchOldGarmentSales);

// fabric
router.get("/dyeing-oldsales", fetchOldDyeingSales);
router.get("/printing-oldsales", fetchOldPrintingSales);
router.get("/washing-oldsales", fetchOldWashingSales);
router.get("/compacting-oldsales", fetchOldCompactingSales);

export default router;