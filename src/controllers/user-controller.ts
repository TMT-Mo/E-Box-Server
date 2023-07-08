import {
  ICookies,
  IDecodedUser,
  LoginRequest,
  UserCollection,
  UserRequestQuery,
} from "./../types/users";
import { Document } from "mongoose";
import { UserModel } from "../models/users";
import { MiddlewareFunction } from "../types/configs";
import { CreateUserRequest, IUser } from "../types/users";
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
import { ResponseList } from "../util/classes";
import { handleQuery } from "../util/helpers";
import bcrypt from "bcryptjs";
import { KEY, StatusAccount } from "../types/constants";
import { getConfigs } from "../configs/configs";
import expressAsyncHandler from "express-async-handler";

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

// ! [POST]: /api/user/createUser
const createUser: MiddlewareFunction = async (req, res, next) => {
  const request = req.body as CreateUserRequest;
  const { username, password, roleName } = request;

  let existingUsername: IUser;

  // * Get user from db
  try {
    existingUsername = await UserModel.findOne({ username });
  } catch (err) {
    const error = new InternalServer();
    return next(res.status(error.code).json(error));
  }

  // * Check if user existed
  if (existingUsername) {
    const error = new BadRequest("User already existed!");
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
      status: StatusAccount.ACTIVE,
      posts: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      activities: []
    });
  } catch (err) {
    const error = new InternalServer();
    return next(res.status(error.code).json(error));
  }
  const response = new CreatedSuccessfully("Create user successfully!");
  return next(res.status(response.code).json(response));
};

// ! [PATCH]: /api/user/updateUser
const updateUser: MiddlewareFunction = async (req, res, next) => {
  const request = req.body as UserCollection;
  const { username, roleName, status } = request;

  let existingUsername: UserCollection;

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

  existingUsername.roleName = roleName;
  existingUsername.status = status;

  try {
    await existingUsername.save();
  } catch (err) {
    const error = new InternalServer();
    return next(res.status(error.code).json(error));
  }
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
      roleName: existUser.roleName,
      id: existUser.id,
    },
    getConfigs().ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    {
      username: existUser.username,
      roleName: existUser.roleName,
      id: existUser.id,
    },
    getConfigs().REFRESH_TOKEN_SECRET,
    { expiresIn: "1d" }
  );

  res.cookie(KEY.REFRESH_TOKEN, refreshToken, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    secure: true,
    sameSite: "none",
    domain: getConfigs().COOKIE_CORS_DOMAIN
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
      const accessToken = jwt.sign(
        {
          username: existUser.username,
          roleName: existUser.roleName,
          id: existUser.id,
        },
        getConfigs().ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
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
};
