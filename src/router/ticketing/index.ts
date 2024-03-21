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

import { Router } from "express";
const router = Router();

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