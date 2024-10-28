import { createTransaction, deleteBulkTransactions, deleteTransaction, exportProcurement, cottonData, fetchTransactionById, fetchTransactions, updateTransaction, uploadTransactionBulk, allVillageCottonData, fetchTransactionsBySeasonAndFarmer, fetchGinnerByVillage } from "../../controllers/procurement";
// import { createLinenDetails, fetchlinenDetails } from "../../controllers/linen-details";
import accessControl from "../../middleware/access-control";
import { Router } from "express";

const router = Router();

router.use(accessControl);

// Farmer & farm Routes
router.get('/get-transactions', fetchTransactions);
router.get('/get-transaction/:id', fetchTransactionById);
router.get('/get-season-farmer-transactions', fetchTransactionsBySeasonAndFarmer);
router.post('/set-transaction', createTransaction);
router.put('/update-transaction', updateTransaction);
router.delete('/delete-transaction', deleteTransaction);
router.delete('/delete-bulk-transactions', deleteBulkTransactions);
router.post('/upload-transactions', uploadTransactionBulk);
router.get('/export-bulk-transactions', exportProcurement);
router.get('/all-village-cotton-data', allVillageCottonData);
router.get('/cotton-data', cottonData);
router.get('/get-ginner', fetchGinnerByVillage);

export default router;  