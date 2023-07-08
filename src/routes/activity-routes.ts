import express from "express";
import { apis } from "../util/api";
import { activityController } from "../controllers/activity-controller";
import { checkAuth } from "../middleware/check-auth";
import { saveActivityValidator } from "../util/express-validator";

const {getActivityList, saveActivity} = activityController
const router = express.Router();

router.use(checkAuth);

router.get(apis.activity.getActivityList, getActivityList)
router.post(apis.activity.saveActivity, saveActivityValidator(), saveActivity)

export const activityRouter = router;
