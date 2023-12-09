import express from "express";
import { addToQueue, createQueue, getFriendQueues, getQueue, incrementQueue, pauseQueue, playQueue, removeFromQueue, updateQueue } from "../controllers/queue";
import validateToken from "../middleware/auth";

const router = express.Router();

router.post('/', validateToken, createQueue);

router.get('/friends', validateToken, getFriendQueues);

router.get('/:queueId', validateToken, getQueue);

router.post('/:queueId', validateToken, addToQueue);

router.put('/:queueId', validateToken, incrementQueue);

router.put('/:queueId/:trackId/:index', validateToken, updateQueue);

router.put('/:queueId/pause', validateToken, pauseQueue);

router.put('/:queueId/play', validateToken, playQueue);

router.delete('/:queueId/:trackId', validateToken, removeFromQueue);

export default router;