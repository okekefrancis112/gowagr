// Import express module
import express from 'express';


// Import controllers and validations
import * as postControllers from '../../controllers/user/post.controller';
import * as postValidations from '../../validations/user/post.validation';
import auth from "../../middlewares/auth.middleware";


// Create router instance
const router = express.Router();

// Routes for post

// POST route to create a new post
router.post(
  '/create',
  auth.auth,
  postValidations.validateCreatePost,
  postControllers.createPost
);

// Get posts
router.get('/', auth.auth, postControllers.getPost);
router.get('/tag/:tag_id', auth.auth, postControllers.getPostByTags);
router.get('/user/:userId', auth.auth, postControllers.getPostByUsers);

// Get posts(paginated)
router.get('/post-paginated', auth.auth, postControllers.getPostPaginated);

// Login an existing post
router.put('/edit/:post_id', auth.auth, postControllers.editPost);

// Delete an existing post
router.delete('/delete/:post_id', auth.auth, postControllers.deletePost);


// Export router
export default router;
