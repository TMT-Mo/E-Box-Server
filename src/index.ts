import express, { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { getConfigs } from "./configs/configs";
import { apis } from "./util/api";
import { userRouter } from "./routes/user-routes";
import { InternalServer } from "./util/http-request";
import bodyParser from "body-parser";
import { postRouter } from "./routes/post-routes";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./configs/swagger.json";
const app = express();
const config = getConfigs();
const { user, post } = apis;

app.use(bodyParser.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(post.head, postRouter);
app.use(user.head, userRouter);

app.use((req: Request, res: Response, next: NextFunction) => {
  const error = new InternalServer();
  return next(res.status(error.code).json(error));
});

mongoose
  .connect(config.MONGO_URL)
  .then(() => {
    console.log("connected");
    app.listen(5000);
  })
  .catch((err) => console.log(err));
