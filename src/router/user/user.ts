import { Router } from "express";
import { createUserCategory, getUserCategories } from "../../controllers/user/user-category";
import { createMenuItem, deleteMenuItem, getMenuList, updateMenuItem } from "../../controllers/user/user-menu";
import { checkRoleExists, createUserRole, deleteUserRole, getUserRole, getUserRoles, updateUserRole } from "../../controllers/user/user-role";
import accessControl from "../../middleware/access-control";
import { getUserInfo, processorLoginAdmin } from "../../controllers/user/user-details";
import { createUser, deleteUser, fetchUser, fetchUsers, updateUser } from "../../controllers/user/user-management";

const router = Router();

router.post("/set-user-category", createUserCategory);
router.get("/get-user-categories", getUserCategories);

router.post("/set-menu-item", createMenuItem);
router.post("/update-menu-item", updateMenuItem);
router.post("/delete-menu-item", deleteMenuItem);
router.get("/get-menu-list", getMenuList);

router.post("/set-user-role", createUserRole);
router.get("/get-user-roles", getUserRoles);
router.get("/get-user-role", getUserRole);
router.put("/update-user-role", updateUserRole);
router.delete("/delete-user-role", deleteUserRole);
router.post("/check-role", checkRoleExists);

router.post("/create-user", createUser);
router.get("/get-users", fetchUsers);
router.get("/get-user", fetchUser);
router.put("/update-user", updateUser);
router.delete("/delete-user", deleteUser);

router.use(accessControl)

router.get("/my-details", getUserInfo)
router.get("/processor-admin", processorLoginAdmin)

export default router;
