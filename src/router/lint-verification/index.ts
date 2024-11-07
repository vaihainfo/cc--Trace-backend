import { Router } from "express";
import { createUser, deleteUser, fetchUser, fetchUsers, updateUser } from "../../controllers/lint-stock-verification/user-management";
import { createVerifiedLintStock, getGinProcessLotDetials, getGinProcessLotNo, getLintVerifiedStocks } from "../../controllers/lint-stock-verification";


const router = Router();

router.post("/create-user", createUser);
router.get("/get-users", fetchUsers);
router.get("/get-user", fetchUser);
router.put("/update-user", updateUser);
router.delete("/delete-user", deleteUser);

router.get("/get-ginner-lots", getGinProcessLotNo);
router.get("/get-gin-process-details", getGinProcessLotDetials);
router.get("/get-verified-stocks", getLintVerifiedStocks);
router.post("/create-verified-stock", createVerifiedLintStock);

export default router;