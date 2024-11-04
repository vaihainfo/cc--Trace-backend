import { Router } from "express";
import { createUser, deleteUser, fetchUser, fetchUsers, updateUser } from "../../controllers/lint-stock-verification/user-management";
import { getGinProcessLotDetials, getGinProcessLotNo } from "../../controllers/lint-stock-verification";


const router = Router();

router.post("/create-user", createUser);
router.get("/get-users", fetchUsers);
router.get("/get-user", fetchUser);
router.put("/update-user", updateUser);
router.delete("/delete-user", deleteUser);

router.get("/get-ginner-lots", getGinProcessLotNo);
router.get("/get-gin-process-details", getGinProcessLotDetials);

export default router;