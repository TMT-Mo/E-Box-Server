import express from "express";
import { userController } from "../controllers/user-controller";
import { apis } from "../util/api";
import { check } from "express-validator";
import { checkAuth } from "../middleware/check-auth";
import { loginValidator } from "../util/express-validator";

const router = express.Router();

export const commentRouter = router;
