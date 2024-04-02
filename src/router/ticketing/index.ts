import {
    createTicketEscalation,
    createTicketEscalations,
    deleteTicketEscalationTypes,
    fetchTicketEscalationPagination
} from "../../controllers/ticketing-escalation-type";

import {
    fetchTicketTracker,
    createTicketTracker,
    updateTicketTrackerStatus,
    fetchTicketTrackerStatus,
    countTicketTracker
} from "../../controllers/tickting";
import accessControl from "../../middleware/access-control";
import { Router } from "express";

const router = Router();

router.use(accessControl);

// Ticketing Routes
router.get('/', fetchTicketTracker);
router.post('/', createTicketTracker);
router.put('/', updateTicketTrackerStatus);
router.get('/status', fetchTicketTrackerStatus);
router.get('/count', countTicketTracker);
router.get('/escalation-type', fetchTicketEscalationPagination);
router.post('/escalation-type', createTicketEscalations);
router.delete('/escalation-type', deleteTicketEscalationTypes);
export default router;  