import express from "express";
import { addToQueue, createQueue, getQueue, removeFromQueue, updateQueue } from "../controllers/queue";
import validateToken from "../middleware/auth";

const router = express.Router();

router.post('/', validateToken, createQueue);

router.get('/:queueId', validateToken, getQueue);

router.put('/:queueId/:trackId/:index', validateToken, updateQueue);

router.put('/:queueId', validateToken, addToQueue);

router.delete('/:queueId/:trackId', validateToken, removeFromQueue);

export default router;