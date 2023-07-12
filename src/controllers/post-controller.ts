import { StatusPostCategory } from "./../types/constants";
import { NextFunction } from "express";
import { MiddlewareFunction } from "../types/configs";
import {
  CreatePostCategoryRequest,
  CreatePostBody,
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
import { Activity, ResponseList } from "../util/classes";
import { StatusPost } from "../types/constants";
import { PostCategoryModel } from "../models/post-categories";
import { activityController } from "./activity-controller";
import axios from "axios";
import { apis } from "../util/api";
import { IActivity } from "../types/activities";

const { saveActivity } = activityController;

// ! [POST]: /api/post/createPost
const createPost: MiddlewareFunction = async (req, res, next) => {
  // * Checking validation of user's input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new BadRequest(errors.array()[0].msg);
    return next(res.status(error.code).json(error));
  }

  const request = req.body as CreatePostBody;

  let user: mongoose.Document & IUser;
  let category: mongoose.Document & IPostCategory;

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

  try {
    category = await PostCategoryModel.findById(request.category);
  } catch (err) {
    const error = new InternalServer(
      "Something went wrong with finding id category!"
    );
    return next(res.status(error.code).json(error));
  }

  if (!category) {
    const error = new BadRequest(
      "Cannot find post category with the provided id."
    );
    return next(res.status(error.code).json(error));
  }

  // * Process multiple sessions. In this case: save createdPost in post model first
  // * then save new post id to user.posts.
  // * If both are successful, mongoose will commit transaction to save both changes.
  // * If one is failed, mongoose will return error.
  try {
    await PostModel.create(request);
  } catch (err) {
    const error = new InternalServer("Cannot add post!");
    return next(res.status(error.code).json(error));
  }

  const activity: IActivity = {
    title: "Create a post",
    description: `A new post ${request.title} has been created`,
    creator: req.user.id,
  };
  const handleActivity = new Activity(activity);
  handleActivity.saveActivity(req);

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

  const activity: IActivity = {
    title: "Update a post",
    description: `A post with id ${id} has been modified.`,
    creator: req.user.id,
  };
  const handleActivity = new Activity(activity);
  handleActivity.saveActivity(req);

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

  const activity: IActivity = {
    title: "create a category",
    description: `A new category called ${request.name} has been created.`,
    creator: req.user.id,
  };
  try {
    const handleActivity = new Activity(activity);
    await handleActivity.saveActivity(req);
  } catch (error) {
    console.log(error);
  }

  const response = new CreatedSuccessfully("Create category successfully!");
  return next(res.status(response.code).json(response));
};

// ! [GET]: /api/post/getCategoryList
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
