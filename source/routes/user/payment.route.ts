// Import express module
import express from 'express';


// Import controllers and validations
import * as paymentControllers from '../../controllers/user/payment.controller';
import * as paymentValidations from '../../validations/user/payment.validation';
import auth from "../../middlewares/auth.middleware";


// Create router instance
const router = express.Router();

// Routes for Payments

// POST route to Register a new Payments (Mobile)
router.post(
  '/create',
  auth.auth,
  paymentValidations.validateCreatePayment,
  paymentControllers.createPayment
);

// Get Payments
router.get('/', auth.auth, paymentControllers.getPayments);

router.get('/get-payment/:payment_id', auth.auth, paymentControllers.getPayment);

// Login an existing Payments
router.put('/edit/:payment_id', auth.auth, paymentControllers.editPayment);


// Export router
export default router;
