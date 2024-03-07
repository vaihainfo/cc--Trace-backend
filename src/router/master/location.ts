import { Router } from "express";
import setCountry from '../../controllers/locations/countries/set-country.controller'
import SetState from "../../controllers/locations/states/set-state.controller";
import fetchStates from "../../controllers/locations/states/fetch-states-all.controller";
import deleteCountry from "../../controllers/locations/countries/delete-country.controller";
import updateCountry from "../../controllers/locations/countries/update-country.controller";
import fetchCountries from "../../controllers/locations/countries/get-countries-all.controller";
import updateState from "../../controllers/locations/states/update-state.controller";
import deleteState from "../../controllers/locations/states/delete-state.controller";
import setDistrict from "../../controllers/locations/districts/set-district.controller";
import fetchDistricts from "../../controllers/locations/districts/get-districts-all.controller";
import updateDistrict from "../../controllers/locations/districts/update-district.controller";
import deleteDistrict from "../../controllers/locations/districts/delete-district.controller";
import setBlock from "../../controllers/locations/blocks/set-blocks.controller";
import fetchBlocks from "../../controllers/locations/blocks/fetch-blocks-all.controller";
import updateBlock from "../../controllers/locations/blocks/update.blocks.controller";
import deleteBlock from "../../controllers/locations/blocks/delete.blocks.controller";
import setVillage from "../../controllers/locations/villages/set-village.controller";
import fetchVillages from "../../controllers/locations/villages/get-villages-all.controller";
import updateVillage from "../../controllers/locations/villages/update-village.controller";
import deleteVillage from "../../controllers/locations/villages/delete-village.controller";
import updateCountryStatus from "../../controllers/locations/countries/update-country-status.controller";
import accessControl from "../../middleware/access-control";
import updateStateStatus from "../../controllers/locations/states/update-state-status.controller";
import updateDistrictStatus from "../../controllers/locations/districts/update-district-status.controller";
import updateBlockStatus from "../../controllers/locations/blocks/update-block-status.controller";
import updateVillageStatus from "../../controllers/locations/villages/update-village-status.controller";
import {
    exportCountry,    
  } from "../../controllers/export";
import { checkCountry } from "../../controllers/locations/countries/get-country.controller";


const router = Router();

router.use(accessControl);

router.get("/get-countries", fetchCountries);
router.post("/check-countries", checkCountry);
router.post("/set-country", setCountry);
router.post("/delete-country", deleteCountry);
router.put("/update-country-status", updateCountryStatus);
router.post("/update-country", updateCountry);
router.get("/export-country", exportCountry);

router.post("/set-state", SetState);
router.get("/get-states", fetchStates);
router.put("/update-state-status", updateStateStatus);
router.post("/update-state", updateState);
router.post("/delete-state", deleteState);

router.post("/set-district", setDistrict);
router.get("/get-districts", fetchDistricts);
router.post("/update-district", updateDistrict);
router.put("/update-district-status", updateDistrictStatus);
router.post("/delete-district", deleteDistrict);

router.post("/set-block", setBlock);
router.get("/get-blocks", fetchBlocks);
router.post("/update-block", updateBlock);
router.put("/update-block-status", updateBlockStatus);
router.post("/delete-block", deleteBlock);

router.post("/set-village", setVillage);
router.get("/get-villages", fetchVillages);
router.post("/update-village", updateVillage);
router.put("/update-village-status", updateVillageStatus);
router.post("/delete-village", deleteVillage);

export default router;
