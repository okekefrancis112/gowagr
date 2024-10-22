// Import express module
import express from "express";

// Import controllers and validations
import * as usersControllers from '../../controllers/admin/users.controller';
// import * as tagValidations from '../../validations/admin/users.validation';
import adminAuth from '../../middlewares/adminAuth.middleware';
import accessAdminAuth from '../../middlewares/adminAccess.middleware';

// Create router instance
const router = express.Router();

// Routes for Users

// GET route to get a users information
router.get(
    "/get-user-info/:userId",
    adminAuth.authAdmin,
    accessAdminAuth("view-users"),
    usersControllers.getUserPersonalInfo
);

// GET route to get all users
router.get(
    "/get-users",
    adminAuth.authAdmin,
    accessAdminAuth("view-users"),
    usersControllers.getUsers
);

// // GET route to export all users
// router.get(
//     "/export-users",
//     adminAuth.authAdmin,
//     accessAdminAuth("view-users"),
//     usersControllers.exportUsers
// );


// Export router
export default router;
