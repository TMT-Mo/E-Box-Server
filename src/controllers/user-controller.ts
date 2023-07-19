import {
  CreateUserBody,
  GetUserByIdRequest,
  ICookies,
  IDecodedUser,
  LoginRequest,
  UpdateUserBody,
  UserRequestQuery,
  IUser,
} from "./../types/users";
import mongoose, { Document } from "mongoose";
import { UserModel } from "../models/users";
import { MiddlewareFunction } from "../types/configs";
import {
  BadRequest,
  CreatedSuccessfully,
  Forbidden,
  InternalServer,
  NotFound,
  RequestSuccessfully,
  Unauthorized,
} from "../util/http-request";
import jwt, { JwtPayload } from "jsonwebtoken";
import { validationResult } from "express-validator";
import { Activity, ResponseList } from "../util/classes";
import { handleQuery } from "../util/helpers";
import bcrypt from "bcryptjs";
import { KEY, CommonStatus } from "../types/constants";
import { getConfigs } from "../configs/configs";
import { ObjectId } from "mongodb";
import { RoleModel } from "../models/roles";
import { IRole } from "../types/roles";
import { IActivity } from "../types/activities";

const { ACTIVE } = CommonStatus;

// ! [GET]: /api/user/getUserList
const getUserList: MiddlewareFunction = async (req, res, next) => {
  const query = req.query as UserRequestQuery;
  const size = +query.size || undefined;
  const currentPage = +query.currentPage || undefined;
  const { roleName, status } = query;
  let userList: Document[] = [];
  let queries = handleQuery({ roleName, status });
  const totalSkip = (currentPage - 1) * size;
  let total: number;

  try {
    userList = await UserModel.find(queries).skip(totalSkip).limit(size);
    total = await UserModel.count(queries);
  } catch (err) {
    const error = new InternalServer();
    return next(res.status(error.code).json(error));
  }
  const response = new ResponseList(size, currentPage, total, userList);
  return next(res.json(response));
};

// ! [GET]: /api/user/getUserById
const getUserById: MiddlewareFunction = async (req, res, next) => {
  const { id } = req.body as GetUserByIdRequest;
  let user: Document & IUser;

  try {
    user = await UserModel.findById(id);
  } catch (err) {
    const error = new InternalServer();
    return next(res.status(error.code).json(error));
  }

  let role: Document & IRole;

  try {
    role = await RoleModel.findById(user.role);
  } catch (err) {
    const error = new InternalServer("Error when finding role!");
    return next(res.status(error.code).json(error));
  }

  return next(res.status(200).json({ ...user, role } as IUser));
};

// ! [POST]: /api/user/createUser
const createUser: MiddlewareFunction = async (req, res, next) => {
  const request = req.body as CreateUserBody;
  const { username, password, role } = request;

  let existingUser: IUser;
  let existingRole: IRole;

  // * Get user from db
  try {
    existingUser = await UserModel.findOne({ username });
  } catch (err) {
    const error = new InternalServer();
    return next(res.status(error.code).json(error));
  }

  // * Check if user existed
  if (existingUser) {
    const error = new BadRequest("User already existed!");
    return next(res.status(error.code).json(error));
  }

  // * Get Role from db
  try {
    existingRole = await RoleModel.findById(role);
  } catch (err) {
    const error = new InternalServer("Something went wrong when finding role!");
    return next(res.status(error.code).json(error));
  }

  // * Check if Role existed
  if (!existingRole) {
    const error = new BadRequest("Role does not exist!");
    return next(res.status(error.code).json(error));
  }

  // * Hash password
  let hashPw: string;
  try {
    hashPw = await bcrypt.hash(password, 8);
  } catch (err) {
    const error = new InternalServer("Hash password unsuccessfully!");
    return next(res.status(error.code).json(error));
  }

  try {
    await UserModel.create({
      ...request,
      password: hashPw,
      status: ACTIVE,
      role: new ObjectId(role),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  } catch (err) {
    console.log(err)
    const error = new InternalServer("Cannot add user!");
    return next(res.status(error.code).json(error));
  }
  const response = new CreatedSuccessfully("Create user successfully!");
  return next(res.status(response.code).json(response));
};

// ! [PATCH]: /api/user/updateUser
const updateUser: MiddlewareFunction = async (req, res, next) => {
  const request = req.body as UpdateUserBody;
  const { username, role, status, id } = request;

  let existingUsername: UpdateUserBody & mongoose.Document;

  try {
    existingUsername = await UserModel.findOne({ username });
  } catch (err) {
    const error = new InternalServer();
    return next(res.status(error.code).json(error));
  }

  if (!existingUsername) {
    const error = new NotFound("User does not exist!");
    return next(res.status(error.code).json(error));
  }

  let existingRole: IRole;
  // * Get Role from db
  try {
    existingRole = await RoleModel.findById(role);
  } catch (err) {
    const error = new InternalServer();
    return next(res.status(error.code).json(error));
  }

  // * Check if Role existed
  if (!existingRole) {
    const error = new BadRequest("Role does not exist!");
    return next(res.status(error.code).json(error));
  }

  existingUsername.role = role;
  existingUsername.status = status;

  try {
    await existingUsername.save();
  } catch (err) {
    const error = new InternalServer();
    return next(res.status(error.code).json(error));
  }

  const activity: IActivity = {
    title: "Update an user",
    description: `An user with id ${id} has been modified.`,
    creator: req.user.id,
  };
  const handleActivity = new Activity(activity);
  handleActivity.saveActivity(req);
  
  const response = new RequestSuccessfully("Update user successfully!");
  return next(res.status(response.code).json(response));
};

// ! [POST]: /api/user/login
const login: MiddlewareFunction = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new BadRequest(errors.array()[0].msg);
    return next(res.status(error.code).json(error));
  }
  const { username, password } = req.body as LoginRequest;

  let existUser: IUser;
  try {
    existUser = await UserModel.findOne({ username });
  } catch (err) {
    const error = new InternalServer();
    return next(res.status(error.code).json(error));
  }

  if (!existUser) {
    const error = new BadRequest(
      "Wrong username or password! Please try again."
    );
    return next(res.status(error.code).json(error));
  }

  let existingRole: IRole;
  // * Get Role from db
  try {
    existingRole = await RoleModel.findById(existUser.role);
  } catch (err) {
    const error = new InternalServer();
    return next(res.status(error.code).json(error));
  }

  // * Check if Role existed
  if (!existingRole) {
    const error = new BadRequest("Role does not exist!");
    return next(res.status(error.code).json(error));
  }

  let compareHashPw: boolean;
  try {
    compareHashPw = await bcrypt.compare(password, existUser.password);
  } catch (err) {
    const error = new InternalServer("Hash password unsuccessfully!");
    return next(res.status(error.code).json(error));
  }

  if (!compareHashPw) {
    const error = new BadRequest(
      "Wrong username or password! Please try again."
    );
    return next(res.status(error.code).json(error));
  }

  const accessToken = jwt.sign(
    {
      username: existUser.username,
      id: existUser.id,
      role: existingRole,
    } as IDecodedUser,
    getConfigs().ACCESS_TOKEN_SECRET,
    { expiresIn: "30m" }
  );

  const refreshToken = jwt.sign(
    {
      username: existUser.username,
      id: existUser.id,
      role: existingRole,
    } as IDecodedUser,
    getConfigs().REFRESH_TOKEN_SECRET,
    { expiresIn: "1d" }
  );

  res.cookie(KEY.REFRESH_TOKEN, refreshToken, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    secure: true,
    sameSite: "none",
    domain: getConfigs().COOKIE_CORS_DOMAIN,
  });
  return next(res.status(200).json({ accessToken }));
};

const refreshToken: MiddlewareFunction = (req, res, next) => {
  const cookies = req.cookies as ICookies;
  const refreshToken = cookies?.refreshToken;

  if (!refreshToken) {
    const error = new Unauthorized();
    return next(res.status(error.code).json(error));
  }

  jwt.verify(
    refreshToken,
    getConfigs().REFRESH_TOKEN_SECRET,
    async (err, decoded: IDecodedUser & JwtPayload) => {
      if (err) {
        const error = new Forbidden();
        return res.status(error.code).json(error);
      }
      let existUser: IUser;
      try {
        existUser = await UserModel.findOne({ username: decoded.username });
      } catch (err) {
        const error = new InternalServer();
        return next(res.status(error.code).json(error));
      }

      if (!existUser) {
        const error = new NotFound("User does not exist!");
        return next(res.status(error.code).json(error));
      }

      let existingRole: IRole;
      // * Get Role from db
      try {
        existingRole = await RoleModel.findById(existUser.role);
      } catch (err) {
        const error = new InternalServer();
        return next(res.status(error.code).json(error));
      }

      // * Check if Role existed
      if (!existingRole) {
        const error = new BadRequest("Role does not exist!");
        return next(res.status(error.code).json(error));
      }

      const accessToken = jwt.sign(
        {
          username: existUser.username,
          role: existingRole,
          id: existUser.id,
        } as IDecodedUser,
        getConfigs().ACCESS_TOKEN_SECRET,
        { expiresIn: "30m" }
      );
      return res.status(200).json({ accessToken });
    }
  );
};

export const userController = {
  getUserList,
  createUser,
  login,
  updateUser,
  refreshToken,
  getUserById,
};
