import {
    createEmailJob,
    createEmailTemplate,
    createEmailTemplates,
    deleteEmailJob,
    getEmailJobById,
    getEmailJobs,
    getEmailTemplateByID,
    getEmailTemplates,
    updateEmailJob
} from "../../controllers/email-management";
import accessControl from "../../middleware/access-control";
import { Router } from "express";
const router = Router();

router.use(accessControl);

// Entity Routes
router.get('/get-email-templates', getEmailTemplates);
router.get('/get-email-template', getEmailTemplateByID);
router.get('/get-email-jobs', getEmailJobs);
router.get('/get-email-job', getEmailJobById);

router.post('/set-email-template', createEmailTemplate);
router.post('/set-bulk-email-templates', createEmailTemplates);
router.post('/set-email-job', createEmailJob);
router.put('/update-email-job', updateEmailJob);
router.delete('/delete-email-job', deleteEmailJob);

export default router;  