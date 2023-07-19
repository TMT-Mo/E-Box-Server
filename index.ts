import express, {
  NextFunction,
  Request,
  Response,
  ErrorRequestHandler,
} from "express";
import mongoose from "mongoose";
import { getConfigs } from "./src/configs/configs";
import { apis } from "./src/util/api";
import { userRouter } from "./src/routes/user-routes";
import { InternalServer } from "./src/util/http-request";
import bodyParser from "body-parser";
import { postRouter } from "./src/routes/post-routes";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./src/configs/swagger.json";
import cors from "cors";
import cookieParser from "cookie-parser";
import { activityRouter } from "./src/routes/activity-routes";
import { commentRouter } from "./src/routes/comment-routes";
import { roleRouter } from "./src/routes/role-routes";
// 
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
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, application/json"
  );
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
app.get("/abc", (req, res, next: NextFunction) => {
  res.send({
    title: "abc",
  });
});

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
