import express from "express";
import { authenticate, refresh } from "../controllers/auth";

const router = express.Router();

router.post("/login", authenticate);

router.post("/refresh", refresh);

export default router;
