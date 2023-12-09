import express from "express";
import { addToQueue, createQueue, deleteQueue, getFriendQueues, getQueue, incrementQueue, joinQueue, leaveQueue, pauseQueue, playQueue, removeFromQueue, removeUserFromQueue, updateQueue } from "../controllers/queue";
import validateToken from "../middleware/auth";

const router = express.Router();

router.post('/', validateToken, createQueue);

router.get('/friends', validateToken, getFriendQueues);

router.get('/:queueId', validateToken, getQueue);

router.post('/:queueId', validateToken, addToQueue);

router.put('/:queueId', validateToken, incrementQueue);

router.delete('/:queueId', validateToken, deleteQueue);

router.put('/:queueId/:trackId/:index', validateToken, updateQueue);

router.put('/:queueId/pause', validateToken, pauseQueue);

router.put('/:queueId/play', validateToken, playQueue);

router.post('/:queueId/user', validateToken, joinQueue);
router.delete('/:queueId/user', validateToken, leaveQueue);
router.delete('/:queueId/user/:userId', validateToken, removeUserFromQueue);

router.delete('/:queueId/:trackId', validateToken, removeFromQueue);

export default router;