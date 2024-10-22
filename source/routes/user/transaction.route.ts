// Import express module
import express from 'express';


// Import controllers and validations
import * as transactionControllers from '../../controllers/user/transaction.controller';
import * as transactionValidations from '../../validations/user/transaction.validation';
import auth from "../../middlewares/auth.middleware";


// Create router instance
const router = express.Router();

// Routes for Transactions

// POST route to Register a new Transactions (Mobile)
router.post(
  '/create',
  auth.auth,
  transactionValidations.validateCreateTransaction,
  transactionControllers.createTransaction
);

// Get Transactions
router.get('/', auth.auth, transactionControllers.getTransactions);
router.get('/get-transaction/:transaction_id', auth.auth, transactionControllers.getTransaction);

// Login an existing Transactions
router.put('/edit/:transaction_id', auth.auth, transactionControllers.editTransaction);


// Export router
export default router;
