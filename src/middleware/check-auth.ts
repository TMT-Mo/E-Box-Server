import jwt from "jsonwebtoken";
import { MiddlewareFunction } from "../types/configs";
import { Unauthorized } from "../util/http-request";

export const checkAuth: MiddlewareFunction = (req, res, next) => {
  const error = new Unauthorized();
  if (!req.headers.authorization) {
    return next(res.status(error.code).json(error));
  }
  try {
    const token = req.headers.authorization.split(" ")[1];
    next();
    // const decodedToken = jwt.verify(token, "supersecret")
  } catch (err) {
    return next(res.status(error.code).json(error));
  }
};
