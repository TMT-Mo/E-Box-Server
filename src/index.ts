import express, {
  NextFunction,
  Request,
  Response,
  ErrorRequestHandler,
} from "express";
import mongoose from "mongoose";
import { getConfigs } from "./configs/configs";
import { apis } from "./util/api";
import { userRouter } from "./routes/user-routes";
import { InternalServer } from "./util/http-request";
import bodyParser from "body-parser";
import { postRouter } from "./routes/post-routes";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./configs/swagger.json";
import cors from "cors";
import cookieParser from "cookie-parser";
import { activityRouter } from "./routes/activity-routes";
import { commentRouter } from "./routes/comment-routes";
import { roleRouter } from "./routes/role-routes";

const app = express();
const config = getConfigs();
const { MONGO_URL, PORT, CLIENT_HOST } = config;
const { user, post, activity, comment, role } = apis;

app.use(bodyParser.json());
app.use(
  cors({
    credentials: true,
    origin: true,
  })
);

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", CLIENT_HOST);
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  next();
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(cookieParser());
app.use(post.head, postRouter);
app.use(user.head, userRouter);
app.use(activity.head, activityRouter);
app.use(comment.head, commentRouter);
app.use(role.head, roleRouter);

app.use((req: Request, res: Response, next: NextFunction) => {
  const error = new InternalServer("Could not find this route!");
  return next(res.status(error.code).json(error));
});

app.use((req: Request, res: Response, next: NextFunction) => {
  const error = new InternalServer();
  return next(res.status(error.code).json(error));
});

mongoose
  .connect(MONGO_URL)
  .then(() => {
    console.log("connected");
    app.listen(PORT || 3000);
  })
  .catch((err) => console.log(err));
