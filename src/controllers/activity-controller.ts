import { validationResult } from "express-validator";
import mongoose from "mongoose";
import { PostModel } from "../models/posts";
import { UserModel } from "../models/users";
import { MiddlewareFunction } from "../types/configs";
import { StatusPost } from "../types/constants";
import { CreatePostRequest } from "../types/posts";
import { IUser } from "../types/users";
import {
  BadRequest,
  InternalServer,
  CreatedSuccessfully,
} from "../util/http-request";
import { SaveActivityRequest } from "../types/activities";
import { ActivityModel } from "../models/activities";

// ! [GET]: /api/activity/getActivityList
const getActivityList: MiddlewareFunction = (req, res, next) => {};

// ! [POST]: /api/activity/createActivity
const saveActivity: MiddlewareFunction = async (req, res, next) => {
  // * Checking validation of user's input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new BadRequest(errors.array()[0].msg);
    return next(res.status(error.code).json(error));
  }

  const request = req.body as SaveActivityRequest;

  let user: mongoose.Document & IUser;

  try {
    user = await UserModel.findById(req.user.id);
  } catch (err) {
    const error = new InternalServer(
      "Something went wrong with finding id user while saving activity!"
    );
    return next(res.status(error.code).json(error));
  }

  if (!user) {
    const error = new BadRequest(
      "Cannot find user with the provided id while saving activity."
    );
    return next(res.status(error.code).json(error));
  }

  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    const createdActivity = new ActivityModel({
      ...request,
    });
    await createdActivity.save({ session });
    user.activities.push(createdActivity);
    await user.save({ session });
    await session.commitTransaction();
  } catch (err) {
    console.log(err);
    const error = new InternalServer("Cannot add activity!");
    return next(res.status(error.code).json(error));
  }

  console.log("Save activity successfully!");
  return 
};

export const activityController = {
  getActivityList,
  saveActivity,
};
