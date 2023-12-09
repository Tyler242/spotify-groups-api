import express from 'express';
import validateToken from '../middleware/auth';
import { searchUsers } from '../controllers/friends';

const router = express.Router();

router.post('/search', validateToken, searchUsers);

export default router;