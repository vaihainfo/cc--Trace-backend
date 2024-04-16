import { Router } from "express";
import controllers from "../controllers/auth";

const router = Router();

router.post("/signup", controllers.register);

router.post("/signin", controllers.login);
router.post("/verify-otp", controllers.verifyOTP);
router.post("/resent-otp", controllers.resendOTP);

router.get("/signout", controllers.logout);

router.post("/forgot-password", controllers.forgotPassword);
router.post("/reset-password", controllers.resetPassword);

router.post("/update-agreement", controllers.userAgreement);

router.post("/update-password", controllers.updatePassword);


export default router;
