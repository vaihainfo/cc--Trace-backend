import { Router } from "express";
import { createLSVUser, deleteLSVUser, fetchUser, fetchUsers, updateProcessor } from "../../controllers/lint-stock-verification/user-management";
import { createVerifiedLintStock, editGinVerifiedStockConfirm, getGinnerVerifiedStocks, getGinProcessLotDetials, getGinProcessLotNo, getLintVerifiedStock, getLintVerifiedStocks, getSCDVerifiedStocks, getSCMVerifiedStocks, updateSCDVerifiedStockConfirm, updateSCMVerifiedStockConfirm } from "../../controllers/lint-stock-verification";


const router = Router();

router.post("/create-lsv-user", createLSVUser);
router.get("/get-users", fetchUsers);
router.get("/get-user", fetchUser);
router.put("/update-lsv-user", updateProcessor);
router.delete("/delete-lsv-user", deleteLSVUser);

router.get("/get-ginner-lots", getGinProcessLotNo);
router.get("/get-gin-process-details", getGinProcessLotDetials);
router.get("/get-verified-stocks", getLintVerifiedStocks);
router.get("/get-ginner-verified-stocks", getGinnerVerifiedStocks);
router.get("/get-scm-verified-stocks", getSCMVerifiedStocks);
router.get("/get-scd-verified-stocks", getSCDVerifiedStocks);

router.get("/get-verified-stock", getLintVerifiedStock);

router.post("/create-verified-stock", createVerifiedLintStock);
router.post("/update-gin-verified-stock", editGinVerifiedStockConfirm);
router.post("/update-scm-verified-stock", updateSCMVerifiedStockConfirm);
router.post("/update-scd-verified-stock", updateSCDVerifiedStockConfirm);


export default router;