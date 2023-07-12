import { validationResult } from "express-validator";
import mongoose from "mongoose";
import { UserModel } from "../models/users";
import { MiddlewareFunction } from "../types/configs";
import { IUser } from "../types/users";
import {
  BadRequest,
  InternalServer,
} from "../util/http-request";
import { SaveActivityRequest } from "../types/activities";
import { ActivityModel } from "../models/activities";

// ! [GET]: /api/activity/getActivityList
const getActivityList: MiddlewareFunction = async (req, res, next) => {
  let activityList: Document[];

  try {
    activityList = await ActivityModel.find();
  } catch (err) {
    const error = new InternalServer("Something went wrong with finding activity!");
    return next(res.status(error.code).json(error));
  }

  return next(res.json({ items: activityList }));
};

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
    await ActivityModel.create(request)
  } catch (err) {
    const error = new InternalServer("Cannot add activity!");
    return next(res.status(error.code).json(error));
  }

  console.log("Save activity successfully!");
};

export const activityController = {
  getActivityList,
  saveActivity,
};
