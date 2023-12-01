import express from "express";
import { addToQueue, createQueue, getQueue, moveInQueue, removeFromQueue } from "../controllers/queue";
import validateToken from "../middleware/auth";

const router = express.Router();

router.post('/', validateToken, createQueue);

router.get('/:queueId', validateToken, getQueue);

router.put('/:queueId/:trackId/:index', validateToken, moveInQueue);

router.put('/:queueId', validateToken, addToQueue);

router.delete('/:queueId/:trackId', validateToken, removeFromQueue);

export default router;