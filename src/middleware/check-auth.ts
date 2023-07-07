import jwt from "jsonwebtoken";
import { MiddlewareFunction } from "../types/configs";
import { Forbidden, Unauthorized } from "../util/http-request";
import { getConfigs } from "../configs/configs";

export const checkAuth: MiddlewareFunction = (req, res, next) => {
  const error = new Unauthorized();
  if (!req.headers.authorization) {
    return next(res.status(error.code).json(error));
  }
  try {
    const token = req.headers.authorization.split(" ")[1];
    jwt.verify(token, getConfigs().ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        const error = new Forbidden();
        return res.status(error.code).json(error);
      }
      console.log(decoded)
      next();
    });
  } catch (err) {
    return next(res.status(error.code).json(error));
  }
};
