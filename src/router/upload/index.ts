import {
    download,
    upload,
    viewFile
} from "../../controllers/upload";
import accessControl from "../../middleware/access-control";
import { Router } from "express";

const router = Router();

router.use(accessControl);

// file Routes
router.get('/:name', viewFile);
router.post('/upload', upload);


export default router;