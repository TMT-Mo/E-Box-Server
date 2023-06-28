
import { NextFunction, Request, Response } from "express"

export interface Config{
    MONGO_URL: string
}

// export type MiddlewareFunction = (req: Request, res: Response, next: NextFunction) => void

export type ErrorMiddlewareFunction = (req: Request, res: Response, next: NextFunction, err: Error) => void

export interface MiddlewareFunction {
    (req: Request, res: Response, next: NextFunction): void
}