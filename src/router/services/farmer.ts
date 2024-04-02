import {
  createFarmer,
  fetchFarmerPagination,
  deleteFarmer,
  updateFarmer,
  fetchFarmPagination,
  createFarmerFarm,
  updateFarmerFarm,
  countFarmWithProgram,
  exportFarmer,
  fetchFarmer,
  fetchFarm,
  generateQrCodeVillage,
  exportQrCode,
  dashboardGraph,
  fetchFarmerPecurement
} from "../../controllers/farmer-registration";
import accessControl from "../../middleware/access-control";
import { Router } from "express";

const router = Router();

router.use(accessControl);

// Farmer & farm Routes
router.get("/", fetchFarmerPagination);
router.get("/get-farmer", fetchFarmer);
router.post("/", createFarmer);
router.put("/", updateFarmer);
router.delete("/", deleteFarmer);
router.get("/export", exportFarmer);
router.get("/generate", generateQrCodeVillage);
router.get("/export-qr", exportQrCode);
router.get("/farm", fetchFarmPagination);
router.get("/farm/get-farm", fetchFarm);
router.post("/farm", createFarmerFarm);
router.put("/farm", updateFarmerFarm);
router.get("/farm/count", countFarmWithProgram);
router.get("/dashboard", dashboardGraph);
router.get("/farmer-precurement", fetchFarmerPecurement);

export default router;
