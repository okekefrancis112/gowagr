// Import express module
import express from 'express';


// Import controllers and validations
import * as tagControllers from '../../controllers/admin/tag.controller';
import * as tagValidations from '../../validations/admin/tag.validation';
import adminAuth from '../../middlewares/adminAuth.middleware';
import accessAdminAuth from '../../middlewares/adminAccess.middleware';


// Create router instance
const router = express.Router();

// Routes for tag

// POST route to Register a new tag (Mobile)
router.post(
  '/create',
  tagValidations.validateCreateTag,
  tagControllers.createTag
);

// Get tags
router.get('/', adminAuth.authAdmin, accessAdminAuth("view-users"), tagControllers.getTags);

// Login an existing tag
router.put('/edit/:tag_id', adminAuth.authAdmin, accessAdminAuth("create-users"), tagControllers.editTag);


// Verify the email of a registered tag
router.delete('/delete/:tag_id', adminAuth.authAdmin, accessAdminAuth("delete-users"), tagControllers.deleteTag);


// Export router
export default router;
