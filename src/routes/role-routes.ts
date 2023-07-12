import express from "express";
import { userController } from "../controllers/user-controller";
import { apis } from "../util/api";
import { check } from "express-validator";
import { checkAuth } from "../middleware/check-auth";
import { createRoleValidator, loginValidator } from "../util/express-validator";
import { roleController } from "../controllers/role-controller";

const router = express.Router();
const {createRole, getRoleList} = roleController

router.use(checkAuth)

router.post(apis.role.createRole, createRoleValidator(), createRole)
router.get(apis.role.getRoleList, getRoleList)

export const roleRouter = router;
