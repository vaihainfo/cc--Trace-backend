import {
    createSupplyChainRating,
    fetchSupplyChainRating,
    updateSupplyChainRating
} from "../../controllers/supply-chain";
import { Router } from "express";
import accessControl from "../../middleware/access-control";

const router = Router();

router.use(accessControl)

router.get('/rating', fetchSupplyChainRating);
router.post('/rating', createSupplyChainRating);
router.put('/rating', updateSupplyChainRating);

export default router;  