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
router.put('/status', fetchTicketTrackerStatus);
router.get('/count', countTicketTracker);

export default router;  