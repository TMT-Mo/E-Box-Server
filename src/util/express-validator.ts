import { ValidationChain, check } from "express-validator";

export const loginValidator = (): ValidationChain[] => [
  check("username").notEmpty().withMessage("username is required"),
  check("password").notEmpty().withMessage("password is required"),
];

export const createPostValidator = (): ValidationChain[] => [
  check("title").notEmpty().withMessage("title is required"),
  check("description").notEmpty().withMessage("description is required"),
];

