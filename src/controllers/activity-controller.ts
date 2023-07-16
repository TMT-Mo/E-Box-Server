import { validationResult } from "express-validator";
import mongoose from "mongoose";
import { UserModel } from "../models/users";
import { MiddlewareFunction } from "../types/configs";
import { IUser } from "../types/users";
import { BadRequest, InternalServer } from "../util/http-request";
import {
  GetActivityByIdRequest,
  GetActivityListRequest,
  SaveActivityRequest,
} from "../types/activities";
import { ActivityModel } from "../models/activities";

// ! [GET]: /api/activity/getActivityList
const getActivityList: MiddlewareFunction = async (req, res, next) => {
  const { id } = req.query as GetActivityListRequest;
  let activityList: Document[];

  try {
    activityList = await ActivityModel.find({ creator: id });
  } catch (err) {
    const error = new InternalServer(
      "Something went wrong with finding activity!"
    );
    return next(res.status(error.code).json(error));
  }

  return next(res.json({ items: activityList }));
};

// // ! [GET]: /api/activity/getActivityById
// const getActivityById: MiddlewareFunction = async (req, res, next) => {
//   const {id} = req.body as GetActivityByIdRequest
//   let activity: Document;

//   try {
//     activity = await ActivityModel.findById(id);
//   } catch (err) {
//     const error = new InternalServer("Something went wrong with finding activity!");
//     return next(res.status(error.code).json(error));
//   }

//   return next(res.json({ activity }));
// };

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
    await ActivityModel.create(request);
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
