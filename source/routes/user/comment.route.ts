// Import express module
import express from 'express';


// Import controllers and validations
import * as commentControllers from '../../controllers/user/comment.controller';
import * as commentValidations from '../../validations/user/comment.validation';
import auth from "../../middlewares/auth.middleware";


// Create router instance
const router = express.Router();

// Routes for Comments

// POST route to Register a new Comments (Mobile)
router.post(
  '/create/:postId',
  auth.auth,
  commentValidations.validateCreateComment,
  commentControllers.createComment
);

// Get Comments
router.get('/:postId', auth.auth, commentControllers.getComments);
router.get('/get-comment/:comment_id', auth.auth, commentControllers.getComment);

// Login an existing Comments
router.put('/edit/:comment_id', auth.auth, commentControllers.editComment);


// Verify the email of a registered Comments
router.delete('/delete/:comment_id', auth.auth, commentControllers.deleteComment);


// Export router
export default router;
