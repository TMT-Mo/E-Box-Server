import { StatusPost } from "./constants";

export interface IPost {
  id: string;
  title: string;
  description: string;
  creator: number;
  createdAt: Date;
  updatedAt: Date;
  status: StatusPost;
}

export interface IPostCategory {
  id: string;
  name: string;
  status: string;
}

export interface CreatePostRequest {
  title: string;
  description: string;
  creator: string;
}
export interface CreatePostCategoryRequest {
  name: string;
}

export interface UpdatePostRequest {
  id: string;
  title: string;
  description: string;
  status: StatusPost;
}

export interface PostRequestQuery {
  currentPage?: number;
  size?: number;
  status?: StatusPost;
}
