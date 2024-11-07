import { Router } from "express";
import { createLSVUser, deleteLSVUser, fetchUser, fetchUsers, updateProcessor } from "../../controllers/lint-stock-verification/user-management";
import { createVerifiedLintStock, getGinProcessLotDetials, getGinProcessLotNo, getLintVerifiedStocks } from "../../controllers/lint-stock-verification";


const router = Router();

router.post("/create-lsv-user", createLSVUser);
router.get("/get-users", fetchUsers);
router.get("/get-user", fetchUser);
router.put("/update-lsv-user", updateProcessor);
router.delete("/delete-lsv-user", deleteLSVUser);

router.get("/get-ginner-lots", getGinProcessLotNo);
router.get("/get-gin-process-details", getGinProcessLotDetials);
router.get("/get-verified-stocks", getLintVerifiedStocks);
router.post("/create-verified-stock", createVerifiedLintStock);

export default router;