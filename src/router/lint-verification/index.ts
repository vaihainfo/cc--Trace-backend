import { Router } from "express";
import { createLSVUser, deleteLSVUser, fetchUser, fetchUsers, updateProcessor } from "../../controllers/lint-stock-verification/user-management";
import { createVerifiedLintStock, editGinVerifiedStockConfirm, fetchTeGinner,fetchTeCountries, fetchTeStates, getGinnerVerifiedStocks, getGinProcessLotDetials, getGinProcessLotNo, getLintVerifiedStock, getLintVerifiedStocks, getListVerifiedStocks, getSCDVerifiedStocks, getSCMVerifiedStocks, getTypeWiseListVerifiedStocks, updateSCDVerifiedStockConfirm, updateSCMVerifiedStockConfirm, getGinSalesLotDetials, getGinSaleLotNo, fetchTeSpinner, fetchBeSpinner, fetchBeCountries, fetchBeStates } from "../../controllers/lint-stock-verification";


const router = Router();

router.post("/create-lsv-user", createLSVUser);
router.get("/get-users", fetchUsers);
router.get("/get-user", fetchUser);
router.put("/update-lsv-user", updateProcessor);
router.delete("/delete-lsv-user", deleteLSVUser);
router.get("/get-te-ginner", fetchTeGinner);
router.get("/get-te-spinners", fetchTeSpinner);
router.get("/get-te-countries", fetchTeCountries);
router.get("/get-te-states", fetchTeStates);

router.get("/get-ginner-lots", getGinProcessLotNo);
router.get("/get-gin-process-details", getGinProcessLotDetials);
router.get("/get-verified-stocks", getLintVerifiedStocks);
router.get("/get-ginner-verified-stocks", getGinnerVerifiedStocks);
router.get("/get-scm-verified-stocks", getSCMVerifiedStocks);
router.get("/get-scd-verified-stocks", getSCDVerifiedStocks);

router.get("/get-verified-stock", getLintVerifiedStock);
router.get("/get-all-verified-stocks", getListVerifiedStocks);
router.get("/get-all-type-verified-stocks", getTypeWiseListVerifiedStocks);

router.post("/create-verified-stock", createVerifiedLintStock);
router.post("/update-gin-verified-stock", editGinVerifiedStockConfirm);
router.post("/update-scm-verified-stock", updateSCMVerifiedStockConfirm);
router.post("/update-scd-verified-stock", updateSCDVerifiedStockConfirm);

//spinner flow
router.get("/get-spinner-lots", getGinSaleLotNo);
router.get("/get-gin-sales-details", getGinSalesLotDetials);
router.get("/get-be-spinners", fetchBeSpinner);
router.get("/get-be-countries", fetchBeCountries);
router.get("/get-be-states", fetchBeStates);

export default router;