import { createEmailJob, createEmailTemplate, getEmailJobById, getEmailJobs, getEmailTemplateByID, getEmailTemplates } from "../../controllers/email-management";

import { Router } from "express";
const router = Router();

// Entity Routes
router.get('/get-email-templates', getEmailTemplates);
router.get('/get-email-template', getEmailTemplateByID);
router.get('/get-email-jobs', getEmailJobs);
router.get('/get-email-job', getEmailJobById);

router.post('/set-email-template', createEmailTemplate);
router.post('/set-email-job', createEmailJob);




export default router;  