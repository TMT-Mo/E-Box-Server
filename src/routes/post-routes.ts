import { postController } from "./../controllers/post-controller";
import express from "express";
import { apis } from "../util/api";
import { createPostValidator } from "../util/express-validator";
import { check } from "express-validator";
import { checkAuth } from "../middleware/check-auth";

const { createPost, getPostList, updatePost } = postController;
const router = express.Router();

router.use(checkAuth)

router.post(apis.post.createPost, createPostValidator(), createPost);
router.patch(apis.post.updatePost, updatePost);
router.get(apis.post.getPostList, getPostList);

export const postRouter = router;
