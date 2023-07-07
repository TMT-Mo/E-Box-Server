import { StatusPostCategory } from "./../types/constants";
import { NextFunction } from "express";
import { MiddlewareFunction } from "../types/configs";
import {
  CreatePostCategoryRequest,
  CreatePostRequest,
  IPost,
  IPostCategory,
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
import { StatusPost } from "../types/constants";
import { PostCategoryModel } from "../models/post-categories";

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
    const createdPost = new PostModel({
      ...request,
      status: StatusPost.Process,
    });
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
  const { status } = query;
  const size = +query.size || undefined;
  const currentPage = +query.currentPage || undefined;
  const queries = handleQuery({ status });
  let postList: mongoose.Document[] = [];
  const totalSkip = (currentPage - 1) * size;
  let total: number;

  try {
    postList = await PostModel.find(queries).skip(totalSkip).limit(size);
  } catch (err) {
    const error = new InternalServer();
    return next(res.status(error.code).json(error));
  }

  const response = new ResponseList(size, currentPage, total, postList);
  return next(res.json(response));
};

// ! [PATCH]: /api/post/updatePost
const updatePost: MiddlewareFunction = async (req, res, next) => {
  const { id, description, title, status } = req.body as UpdatePostRequest;

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
  existedPost.status = status;

  try {
    await existedPost.save();
  } catch (err) {
    const error = new InternalServer("Something went wrong with updating post");
    return next(res.status(error.code).json(error));
  }

  const response = new RequestSuccessfully("Update post successfully!");
  return next(res.status(response.code).json(response));
};

// ! [POST]: /api/post/createCategory
const createCategory: MiddlewareFunction = async (req, res, next) => {
  // * Checking validation of user's input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new BadRequest(errors.array()[0].msg);
    return next(res.status(error.code).json(error));
  }

  const request = req.body as CreatePostCategoryRequest;

  let category: mongoose.Document & IPostCategory;

  try {
    category = await PostCategoryModel.findOne({ name: request.name });
  } catch (err) {
    const error = new InternalServer(
      "Something went wrong with finding category name!"
    );
    return next(res.status(error.code).json(error));
  }

  if (category) {
    const error = new BadRequest("This category name already existed!");
    return next(res.status(error.code).json(error));
  }

  try {
    await PostCategoryModel.create({
      ...request,
      status: StatusPostCategory.ACTIVE,
    });
  } catch (err) {
    const error = new InternalServer("Cannot add category!");
    return next(res.status(error.code).json(error));
  }

  const response = new CreatedSuccessfully("Create category successfully!");
  return next(res.status(response.code).json(response));
};

const getCategoryList: MiddlewareFunction = async (req, res, next) => {
  let categoryList: Document[] = [];

  try {
    categoryList = await PostCategoryModel.find();
  } catch (err) {
    console.log(err);
    const error = new InternalServer();
    return next(res.status(error.code).json(error));
  }

  return next(res.json({ items: categoryList }));
};

export const postController = {
  createPost,
  getPostList,
  updatePost,
  createCategory,
  getCategoryList,
};
