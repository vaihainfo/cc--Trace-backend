import { Router } from "express";
import { fetchOldKnitterSales } from "../../controllers/oldsales/knitter";
import { fetchOldWeaverSales } from "../../controllers/oldsales/weaver";
import { fetchOldGarmentSales } from "../../controllers/oldsales/garment";

const router = Router();

// knitter
router.get("/knitter-oldsales", fetchOldKnitterSales);

// weaver
router.get("/weaver-oldsales", fetchOldWeaverSales);

// garment
router.get("/garment-oldsales", fetchOldGarmentSales);

export default router;