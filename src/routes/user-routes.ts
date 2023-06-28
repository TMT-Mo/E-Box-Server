import express from "express";
import { userController } from "../controllers/user-controller";
import { apis } from "../util/api";
import { check } from "express-validator";
import { checkAuth } from "../middleware/check-auth";
import { loginValidator } from "../util/express-validator";

const router = express.Router();
const { getUserList, createUser, login, updateUser } = userController;


router.post(
  apis.user.login,
  loginValidator(),
  login
);
router.use(checkAuth);
router.get(apis.user.getUserList, getUserList);
router.post(apis.user.createUser, createUser);
router.patch(apis.user.updateUser, updateUser);

export const userRouter = router;
