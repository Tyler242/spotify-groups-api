import express from "express";
import { addToQueue, createQueue, getQueue } from "../controllers/queue";
import validateToken from "../middleware/auth";

const router = express.Router();

router.post('/', validateToken, createQueue);

router.get('/:queueId', validateToken, getQueue);

router.put('/:queueId', validateToken, addToQueue);

export default router;