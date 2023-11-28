import express from "express"
import { getSecrets } from "../controllers/secrets";

const router = express.Router();

router.get('/', getSecrets);

export default router;