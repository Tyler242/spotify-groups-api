import express from "express";
import { authenticate, refresh, signup } from "../controllers/auth";

const router = express.Router();

router.post("/login", authenticate);

router.post("/signup", signup);

router.post("/refresh", refresh);

export default router;
