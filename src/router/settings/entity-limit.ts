import { fetchEntityLimits, updateEntityLimit } from "../../controllers/entity-limit";
import accessControl from "../../middleware/access-control";
import { Router } from "express";
const router = Router();

router.use(accessControl);

// Entity Routes
router.get('/', fetchEntityLimits);
// router.get('/get-entity-limit', fetchEntityLimit);
// router.post('/set-entity-limit', createEntityLimit);
router.put('/', updateEntityLimit);
// router.delete('/delete-entity-limit', deleteEntityLimit);


export default router;  