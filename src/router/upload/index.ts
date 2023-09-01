import {
    download,
    upload,
    viewFile
} from "../../controllers/upload";

import { Router } from "express";
const router = Router();

// file Routes
router.get('/:name', viewFile);
router.post('/upload', upload);


export default router;