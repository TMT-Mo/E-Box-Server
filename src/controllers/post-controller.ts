import { NextFunction } from "express";
import { MiddlewareFunction } from "../types/configs";
import {
  CreatePostRequest,
  IPost,
  PostRequestQuery,
  UpdatePostRequest,
} from "../types/posts";
import {
  BadRequest,
  CreatedSuccessfully,
  InternalServer,
  RequestSuccessfully,
} from "../util/http-request";
import { validationResult } from "express-validator";
import { IUser } from "../types/users";
import { UserModel } from "../models/users";
import { PostModel } from "../models/posts";
import mongoose from "mongoose";
import { handleQuery } from "../util/helpers";
import { ResponseList } from "../util/classes";

// ! [POST]: /api/post/createPost
const createPost: MiddlewareFunction = async (req, res, next) => {
  // * Checking validation of user's input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new BadRequest(errors.array()[0].msg);
    return next(res.status(error.code).json(error));
  }

  const request = req.body as CreatePostRequest;

  let user: mongoose.Document & IUser;
  try {
    user = await UserModel.findById(request.creator);
  } catch (err) {
    const error = new InternalServer(
      "Something went wrong with finding id user!"
    );
    return next(res.status(error.code).json(error));
  }

  if (!user) {
    const error = new BadRequest("Cannot find user with the provided id.");
    return next(res.status(error.code).json(error));
  }

  // * Process multiple sessions. In this case: save createdPost in post model first
  // * then save new post id to user.posts.
  // * If both are successful, mongoose will commit transaction to save both changes.
  // * If one is failed, mongoose will return error.
  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    const createdPost = new PostModel({ ...request });
    await createdPost.save({ session });
    user.posts.push(createdPost);
    await user.save({ session });
    await session.commitTransaction();
  } catch (err) {
    const error = new InternalServer("Cannot add post!");
    return next(res.status(error.code).json(error));
  }

  const response = new CreatedSuccessfully("Create post successfully!");
  return next(res.status(response.code).json(response));
};

// ! [GET]: /api/post/getPostList
const getPostList: MiddlewareFunction = async (req, res, next) => {
  const query = req.query as PostRequestQuery;
  const size = +query.size || undefined;
  const currentPage = +query.currentPage || undefined;
  let postList: mongoose.Document[] = [];
  const totalSkip = (currentPage - 1) * size;
  let total: number;

  try {
    postList = await PostModel.find().skip(totalSkip).limit(size);
  } catch (err) {
    const error = new InternalServer();
    return next(res.status(error.code).json(error));
  }

  const response = new ResponseList(size, currentPage, total, postList);
  return next(res.json(response));
};

// ! [PATCH]: /api/post/updatePost
const updatePost: MiddlewareFunction = async (req, res, next) => {
  console.log("first");
  const { id, description, title } = req.body as UpdatePostRequest;

  let existedPost: mongoose.Document & IPost;

  try {
    existedPost = await PostModel.findById(id);
  } catch (err) {
    const error = new InternalServer();
    return next(res.status(error.code).json(error));
  }

  if (!existedPost) {
    const error = new BadRequest("This post does not exist!");
    return next(res.status(error.code).json(error));
  }

  existedPost.title = title;
  existedPost.description = description;

  try {
    await existedPost.save();
  } catch (err) {
    const error = new InternalServer("Something went wrong with updating post");
    return next(res.status(error.code).json(error));
  }

  const response = new RequestSuccessfully("Update post successfully!");
  return next(res.status(response.code).json(response));
};

export const postController = {
  createPost,
  getPostList,
  updatePost,
};
