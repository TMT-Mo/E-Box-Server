"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const configs_1 = require("./src/configs/configs");
const api_1 = require("./src/util/api");
const user_routes_1 = require("./src/routes/user-routes");
const http_request_1 = require("./src/util/http-request");
const body_parser_1 = __importDefault(require("body-parser"));
const post_routes_1 = require("./src/routes/post-routes");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_json_1 = __importDefault(require("./src/configs/swagger.json"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const activity_routes_1 = require("./src/routes/activity-routes");
const comment_routes_1 = require("./src/routes/comment-routes");
const role_routes_1 = require("./src/routes/role-routes");
// 
const app = (0, express_1.default)();
const config = (0, configs_1.getConfigs)();
const { MONGO_URL, PORT, CLIENT_HOST } = config;
const { user, post, activity, comment, role } = api_1.apis;
app.use(body_parser_1.default.json());
app.use((0, cors_1.default)({
    credentials: true,
    origin: true,
}));
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", CLIENT_HOST);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, application/json");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    next();
});
app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_json_1.default));
app.use((0, cookie_parser_1.default)());
app.use(post.head, post_routes_1.postRouter);
app.use(user.head, user_routes_1.userRouter);
app.use(activity.head, activity_routes_1.activityRouter);
app.use(comment.head, comment_routes_1.commentRouter);
app.use(role.head, role_routes_1.roleRouter);
app.get("/abc", (req, res, next) => {
    res.send({
        title: "abc",
    });
});
app.use((req, res, next) => {
    const error = new http_request_1.InternalServer("Could not find this route!");
    return next(res.status(error.code).json(error));
});
app.use((req, res, next) => {
    const error = new http_request_1.InternalServer();
    return next(res.status(error.code).json(error));
});
mongoose_1.default
    .connect(MONGO_URL)
    .then(() => {
    console.log("connected");
    app.listen(PORT || 3000);
})
    .catch((err) => console.log(err));
//# sourceMappingURL=index.js.map