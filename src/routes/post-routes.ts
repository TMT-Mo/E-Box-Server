import { postController } from "./../controllers/post-controller";
import express from "express";
import { apis } from "../util/api";
import { createPostCategoryValidator, createPostValidator } from "../util/express-validator";
import { check } from "express-validator";
import { checkAuth } from "../middleware/check-auth";

const { createPost, getPostList, updatePost, createCategory, getCategoryList } = postController;
const router = express.Router();

router.use(checkAuth);

// *Post
router.post(apis.post.createPost, createPostValidator(), createPost);
router.patch(apis.post.updatePost, updatePost);
router.get(apis.post.getPostList, getPostList);

// *Category
router.post(apis.post.createCategory, createPostCategoryValidator(), createCategory);
router.get(apis.post.getCategoryList, getCategoryList);


export const postRouter = router;
