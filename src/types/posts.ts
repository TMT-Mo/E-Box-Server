import { ObjectId } from "mongoose";
import { StatusPost } from "./constants";

export interface IPost {
  id: string;
  title: string;
  description: string;
  creator: string;
  createdAt: Date;
  updatedAt: Date;
  status: StatusPost;
  category: string;
  feedback: string;
  approver: string
}

export interface IPostCategory {
  id: string;
  name: string;
  status: string;
}

export interface CreatePostBody {
  title: string;
  description: string;
  creator: string;
  category: ObjectId
}
export interface CreatePostCategoryRequest {
  name: string;
}

export interface UpdatePostRequest {
  id: string;
  title: string;
  description: string;
  status: StatusPost;
  approver: string;
  feedback: string
}

export interface PostRequestQuery {
  currentPage?: number;
  size?: number;
  status?: StatusPost;
  title?: string;
  category?: string;
}
