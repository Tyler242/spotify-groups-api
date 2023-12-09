import express from 'express';
import validateToken from '../middleware/auth';
import { addFriend, getFriends, getName, removeFriend, searchUsers } from '../controllers/friends';

const router = express.Router();

router.post('/', validateToken, addFriend);

router.get('/', validateToken, getFriends);

router.post('/search', validateToken, searchUsers);

router.delete('/:friendUserId', validateToken, removeFriend);

router.get('/:friendUserId/name', validateToken, getName);

export default router;