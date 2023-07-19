import dotenv  from 'dotenv';
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
// 
const app = express();
const config = getConfigs();
dotenv.config()
const { MONGO_URI, CLIENT_HOST } = config;
const { user, post, activity, comment, role } = apis;

mongoose.set('strictQuery', false);

const PORT = process.env.PORT || 3000
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}
// 
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
// app.use(post.head, postRouter);
app.use(user.head, userRouter);
// app.use(activity.head, activityRouter);
// app.use(comment.head, commentRouter);
// app.use(role.head, roleRouter);

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

connectDB().then(() => {
  app.listen(PORT, () => {
      console.log("listening for requests");
  })
})
