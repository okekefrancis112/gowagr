// Import express module
import express from 'express';

// Import controllers and validations
import * as adminUserControllers from '../../controllers/admin/adminUser.controller';
import * as AdminUserValidations from '../../validations/admin/adminUser.validation';
import adminAuth from '../../middlewares/adminAuth.middleware';
import accessAdminAuth from '../../middlewares/adminAccess.middleware';

// Create router instance
const router = express.Router();

// Routes for Admin-User

// POST route to login Admin-User
router.post('/login',
  AdminUserValidations.validateLoginAdminUser,
  adminUserControllers.Login);

// POST route to create Admin-User
router.post(
  '/create',
  adminAuth.authAdmin, // authentication middleware
  accessAdminAuth('create-admin-users'), // permission middleware
  AdminUserValidations.validateCreateAdminUser, // validation middleware
  adminUserControllers.Create // controller to handle the request
);

// POST route to create Admin-User token
router.post(
  '/complete/:token',
  AdminUserValidations.validateCompleteAdminUser, // validation middleware
  adminUserControllers.CompleteRegistration // controller to handle the request
);

// POST route to recover Admin-User password
router.post('/recover', AdminUserValidations.validateRecoverAdmin, adminUserControllers.recover);

// POST route to verify Admin-User OTP
router.post('/verify-otp', AdminUserValidations.validateVerifyOtp, adminUserControllers.verifyOtp);

// POST route to reset Admin-User password
router.post(
  '/reset',
  AdminUserValidations.validateResetPassword, // validation middleware
  adminUserControllers.resetPassword // controller to handle the request
);

// GET route to get all Admin-Users
router.get(
  '/get-admin-users',
  adminAuth.authAdmin, // authentication middleware
  accessAdminAuth('view-admin-users'), // permission middleware
  adminUserControllers.getAllAdmins // controller to handle the request
);

// GET route to get Admin-User details
router.get('/details', adminAuth.authAdmin, adminUserControllers.getAdminUserDetails);

// Export router
export default router;
