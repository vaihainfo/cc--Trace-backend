import { sendOrganicFarmerReport } from "../../controllers/send-emails";
import {
    createEmailJob,
    createEmailTemplate,
    deleteEmailJob,
    getEmailJobById,
    getEmailJobs,
    getEmailTemplateByID,
    getEmailTemplates,
    updateEmailJob
} from "../../controllers/email-management";

import { Router } from "express";
const router = Router();

// Entity Routes
router.get('/get-email-templates', getEmailTemplates);
router.get('/get-email-template', getEmailTemplateByID);
router.get('/get-email-jobs', getEmailJobs);
router.get('/get-email-job', getEmailJobById);

router.post('/set-email-template', createEmailTemplate);
router.post('/set-email-job', createEmailJob);
router.put('/update-email-job', updateEmailJob);
router.delete('/delete-email-job', deleteEmailJob);
router.get('/send-bale', sendOrganicFarmerReport);

export default router;  