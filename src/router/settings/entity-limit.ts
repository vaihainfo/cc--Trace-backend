import { createEntityLimit, deleteEntityLimit, fetchEntityLimit, fetchEntityLimits, updateEntityLimit } from "../../controllers/entity-limit";

import { Router } from "express";
const router = Router();

// Entity Routes
router.get('/get-entity-limits', fetchEntityLimits);
router.get('/get-entity-limit', fetchEntityLimit);
router.post('/set-entity-limit', createEntityLimit);
router.put('/update-entity-limit', updateEntityLimit);
router.delete('/delete-entity-limit', deleteEntityLimit);


export default router;  