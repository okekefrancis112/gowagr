// Import express module
import express from 'express';


// Import controllers and validations
import * as userControllers from '../../controllers/user/user.controller';
import * as UserValidations from '../../validations/user/user.validation';
import auth from "../../middlewares/auth.middleware";
const multer = require('multer');



const storage = multer.diskStorage({
    destination: (req:any, file:any, cb:any) => {
      cb(null, 'uploads/');
    },
    filename: (req:any, file:any, cb:any) => {
      cb(null, Date.now() + '-' + file.originalname);
    },
  });
  const upload = multer({ storage: storage });


// Create router instance
const router = express.Router();

// Routes for User

// POST route to Register a new user (Mobile)
router.post(
  '/register-mobile',
  UserValidations.validateCreateUserMobile,
  userControllers.RegisterMobile
);

// Login an existing user
router.post('/login-mobile', UserValidations.validateLoginUser, userControllers.LoginMobile);


// Verify the email of a registered user
router.post('/verify', UserValidations.validateVerifyUser, userControllers.VerifyEmail);

// Resend verification email to a registered user
router.post(
  '/resend',
  UserValidations.validateResendVerification,
  userControllers.resendVerification
);

// Recover password of a registered user
router.post('/recover', UserValidations.validateEmailRecovery, userControllers.recover);

// Verify OTP of a registered user
router.post('/verify-otp', UserValidations.validateVerifyUser, userControllers.verifyOtp);

// Reset password of a registered user
router.post('/reset', UserValidations.validateResetPassword, userControllers.resetPassword);

// Reset details of a registered user
router.get('/', auth.auth, userControllers.getUserDetails);
router.get('/users', auth.auth, userControllers.getUsers);
router.get('/search', auth.auth, userControllers.searchUsers);
router.get('/tags', userControllers.getTags);

router.post('/upload', auth.auth, upload.single('file'), userControllers.uploadProfileImage);
router.get('/uploads/:filename',auth.auth, userControllers.getProfileImage);


// Export router
export default router;
