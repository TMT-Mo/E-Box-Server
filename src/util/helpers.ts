import { NextFunction, Response, Request } from "express";
import { Result, ValidationError, validationResult } from "express-validator";
import { BadRequest } from "./http-request";

export const handleQuery = (args: {}): object => {
  let queries = {};
  Object.entries(args).forEach(([key, value]) => {
    if (!value) return;
    queries = { ...queries, [key]: value };
  });
  console.log(queries);
  if (Object.keys(args).length === 0) {
    return {};
  }
  return queries;
};


