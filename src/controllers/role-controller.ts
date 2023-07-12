import { validationResult } from "express-validator";
import mongoose from "mongoose";
import { MiddlewareFunction } from "../types/configs";
import { IUser } from "../types/users";
import {
  BadRequest,
  InternalServer,
  CreatedSuccessfully,
} from "../util/http-request";
import { CreateRoleBody } from "../types/roles";
import { RoleModel } from "../models/roles";
import { CommonStatus } from "../types/constants";
import { IActivity } from "../types/activities";
import { Activity } from "../util/classes";

const { ACTIVE } = CommonStatus;

// ! [GET]: /api/role/getRoleList
const getRoleList: MiddlewareFunction = async (req, res, next) => {
  let roleList: Document[];

  try {
    roleList = await RoleModel.find();
  } catch (err) {
    const error = new InternalServer("Something went wrong with finding role!");
    return next(res.status(error.code).json(error));
  }

  return next(res.json({ items: roleList }));
};

// ! [POST]: /api/role/createRole
const createRole: MiddlewareFunction = async (req, res, next) => {
  // * Checking validation of user's input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new BadRequest(errors.array()[0].msg);
    return next(res.status(error.code).json(error));
  }

  const request = req.body as CreateRoleBody;
  const { name } = request;

  let role: mongoose.Document;

  try {
    role = await RoleModel.findOne({ name });
  } catch (err) {
    const error = new InternalServer(
      "Something went wrong with verify unique role name!"
    );
    return next(res.status(error.code).json(error));
  }

  if (role) {
    const error = new BadRequest("This role already existed!");
    return next(res.status(error.code).json(error));
  }

  try {
    await RoleModel.create({ name, status: ACTIVE });
  } catch (err) {
    const error = new InternalServer(
      "Something went wrong with adding new role!"
    );
    return next(res.status(error.code).json(error));
  }

  const activity: IActivity = {
    title: "Create a role",
    description: `A new role called ${request.name} has been created.`,
    creator: req.user.id,
  };
  const handleActivity = new Activity(activity);
  handleActivity.saveActivity(req);

  const response = new CreatedSuccessfully("Create role successfully!");
  return next(res.status(response.code).json(response));
};

export const roleController = {
  createRole,
  getRoleList,
};
