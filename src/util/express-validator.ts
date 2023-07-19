import { ValidationChain, check } from "express-validator";

export const loginValidator = (): ValidationChain[] => [
  check("username").notEmpty().withMessage("username is required"),
  check("password").notEmpty().withMessage("password is required"),
];

export const createUserValidator = (): ValidationChain[] => [
  check("username").notEmpty().withMessage("username is required"),
  check("password").notEmpty().withMessage("password is required"),
  check("role").notEmpty().withMessage("role is required"),
];

export const updateUserValidator = (): ValidationChain[] => [
  check("username").notEmpty().withMessage("username is required"),
  check("password").notEmpty().withMessage("password is required"),
  check("role").notEmpty().withMessage("role is required"),
];

export const createPostValidator = (): ValidationChain[] => [
  check("title").notEmpty().withMessage("title is required"),
  check("description").notEmpty().withMessage("description is required"),
  check("category").notEmpty().withMessage("category is required"),
];

export const createPostCategoryValidator = (): ValidationChain[] => [
  check("name").notEmpty().withMessage("name is required"),
];

export const createRoleValidator = (): ValidationChain[] => [
  check("name").notEmpty().withMessage("name is required"),
];

export const saveActivityValidator = (): ValidationChain[] => [
  check("title").notEmpty().withMessage("title is required"),
  check("description").notEmpty().withMessage("description is required"),
];

