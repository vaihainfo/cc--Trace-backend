import { createStyleMark, checkStyleMarkNumbers, createStyleMarkNumbers, deleteStyleMark, fetchStyleMarkPagination, updateStyleMark, updateStyleMarkStatus } from "../../controllers/style-mark-no";
import accessControl from "../../middleware/access-control";
import { Router } from "express";
const router = Router();

// router.use(accessControl);

// Department Routes
router.get('/', fetchStyleMarkPagination);
router.post('/check-style-mark', checkStyleMarkNumbers);
router.post('/', createStyleMark);
router.post('/multiple', createStyleMarkNumbers);
router.put('/', updateStyleMark);
router.put('/status', updateStyleMarkStatus);
router.delete('/', deleteStyleMark);


export default router;