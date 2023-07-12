
import { NextFunction, Request, Response } from "express"
import { IDecodedUser } from "./users"

export interface Config{
    MONGO_URL: string,
    PORT: number,
    ACCESS_TOKEN_SECRET: string,
    REFRESH_TOKEN_SECRET: string,
    CLIENT_HOST: string,
    SERVER_HOST: string,
    COOKIE_CORS_DOMAIN: string,
}

// export type MiddlewareFunction = (req: Request, res: Response, next: NextFunction) => void
export interface CustomExpressRequest extends Request{
    user: IDecodedUser
  }
export type ErrorMiddlewareFunction = (req: Request, res: Response, next: NextFunction, err: Error) => void

export interface MiddlewareFunction {
    (req: CustomExpressRequest, res: Response, next: NextFunction): void
}

