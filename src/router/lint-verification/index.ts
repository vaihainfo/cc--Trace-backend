import { Router } from "express";
import { createUser, deleteUser, fetchUser, fetchUsers, updateUser } from "../../controllers/lint-stock-verification/user-management";


const router = Router();

router.post("/create-user", createUser);
router.get("/get-users", fetchUsers);
router.get("/get-user", fetchUser);
router.put("/update-user", updateUser);
router.delete("/delete-user", deleteUser);

export default router;