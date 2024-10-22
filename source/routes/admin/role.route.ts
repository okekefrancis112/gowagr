// Import the Express library
import express from 'express';

// Import role controllers and validations
import * as roleControllers from '../../controllers/admin/role.controller';
import * as RoleValidations from '../../validations/admin/role.validation';

// Import authentication middleware
import adminAuth from '../../middlewares/adminAuth.middleware';
import accessAdminAuth from '../../middlewares/adminAccess.middleware';

// Create new router
const router = express.Router();

//Create a new route to create a role (using POST request)
router.post(
  '/create', // Route
  adminAuth.authAdmin, // Authentication
  accessAdminAuth('create-roles'), // Access Authorization
  RoleValidations.validateCreateRole, // Request Validations
  roleControllers.createRole // Controller to handle request
);

// Create a new route to get an array of roles (using GET request)
router.get(
  '/get-roles', // Route
  adminAuth.authAdmin, // Authentication
  accessAdminAuth('view-roles'), // Access Authorization
  roleControllers.getRoles // Controller to handle request
);

// Create a new route to get a single role's information (using GET request)
router.get(
  '/get-role/:roleId', // Route
  adminAuth.authAdmin, // Authentication
  accessAdminAuth('view-roles'), // Access Authorization
//   RoleValidations.validateRoleId, // Request Validations
  roleControllers.getRole // Controller to handle request
);

// Create a new route to update a role's information (using PUT request)
router.put(
  '/update-role/:roleId', // Route
  adminAuth.authAdmin, // Authentication
  accessAdminAuth('create-roles'), // Access Authorization
//   RoleValidations.validateRoleId, // Request Validations
  roleControllers.updateRole // Controller to handle request
);

// Create a new route to delete a role (using DELETE request)
router.delete(
  '/delete-role/:roleId', // Route
  adminAuth.authAdmin, // Authentication
  accessAdminAuth('delete-roles'), // Access Authorization
//   RoleValidations.validateRoleId, // Request Validations
  roleControllers.deleteRole // Controller to handle request
);

// Create a new route to enable a role (using PUT request)
router.put(
  '/enable-role/:roleId', // Route
  adminAuth.authAdmin, // Authentication
  accessAdminAuth('create-roles'), // Access Authorization
//   RoleValidations.validateRoleId, // Request Validations
  roleControllers.enableRole // Controller to handle request
);

// Create a new route to disable a role (using PUT request)
router.put(
  '/disable-role/:roleId', // Route
  adminAuth.authAdmin, // Authentication
  accessAdminAuth('delete-roles'), // Access Authorization
//   RoleValidations.validateRoleId, // Request Validations
  roleControllers.disableRole // Controller to handle request
);

// Create a new route to add permissions to a role (using PUT request)
router.put(
  '/add-permissions/:roleId', // Route
  adminAuth.authAdmin, // Authentication
  accessAdminAuth('create-roles'), // Access Authorization
//   RoleValidations.validateRoleId, // Request Validations
  roleControllers.addPermissions // Controller to handle request
);

// Create a new route to remove permissions from a role (using PUT request)
router.put(
  '/remove-permissions/:roleId', // Route
  adminAuth.authAdmin, // Authentication
  accessAdminAuth('create-roles'), // Access Authorization
//   RoleValidations.validateRoleId, // Request Validations
  roleControllers.removePermissions // Controller to handle request
);

// Create a new route to get list of available permissions (using GET request)
router.get(
  '/permissions', // Route
  adminAuth.authAdmin, // Authentication
  accessAdminAuth('view-roles'), // Access Authorization
  roleControllers.getPermissions // Controller to handle request
);

// Export router with all routes
export default router;