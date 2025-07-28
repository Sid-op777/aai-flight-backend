import { Router } from 'express';
import { registerUser, loginUser, getUserProfile, updateUserProfile, getUsersByIds } from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/api/users/register', registerUser);
router.post('/api/users/login', loginUser);

router
  .route('/api/users/me')
  .get(authMiddleware, getUserProfile)
  .put(authMiddleware, updateUserProfile);

router.get('/batch', getUsersByIds);

export default router;