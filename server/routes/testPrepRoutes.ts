import express from "express";
import { handleTestPrep } from "../controllers/testPrepController";

const router = express.Router();

router.get("/", handleTestPrep);

export default router;
