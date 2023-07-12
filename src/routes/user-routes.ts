import express from "express";
import { userController } from "../controllers/user-controller";
import { apis } from "../util/api";
import { check } from "express-validator";
import { checkAuth } from "../middleware/check-auth";
import { createUserValidator, loginValidator, updateUserValidator } from "../util/express-validator";

const router = express.Router();
const { getUserList, createUser, login, updateUser, refreshToken, getUserById } = userController;


router.post(
  apis.user.login,
  loginValidator(),
  login
);

router.get(apis.user.refreshToken, refreshToken)

router.use(checkAuth);

router.get(apis.user.getUserList, getUserList);
router.get(apis.user.getUserById, getUserById);
router.post(apis.user.createUser, createUserValidator(), createUser);
router.patch(apis.user.updateUser, updateUserValidator(), updateUser);

export const userRouter = router;
