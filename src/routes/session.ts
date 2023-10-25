import express from "express";
import validateToken from "../middleware/auth";

const router = express.Router();

router.get("/", validateToken);

export default router;
