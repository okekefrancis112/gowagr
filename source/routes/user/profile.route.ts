// Import express module
import express from 'express';


// Import controllers and validations
import * as profileControllers from '../../controllers/user/profile.controller';
import * as ProfileValidations from '../../validations/user/profile.validation';
import auth from "../../middlewares/auth.middleware";


// Create router instance
const router = express.Router();

// Routes for Profile

// POST route to get profile
router.get(
  '/',
  auth.auth,
  profileControllers.getUserProfile
);

// Edit an existing user details
router.put('/edit', auth.auth, profileControllers.editProfile);


// Change the password of a registered user
router.put('/change-password', auth.auth, ProfileValidations.validateChangePassword, profileControllers.changePassword);

// Soft-delete a registered user
router.delete('/delete', auth.auth, profileControllers.softDeleteAccount);


// Export router
export default router;
