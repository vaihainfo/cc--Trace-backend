import { Router } from "express";
import { fetchOldKnitterSales } from "../../controllers/oldsales/knitter";

const router = Router();

// knitter
router.get("/knitter-oldsales", fetchOldKnitterSales);

export default router;