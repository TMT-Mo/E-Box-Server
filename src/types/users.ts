
import { StatusAccount } from "./constants";
import { Document } from "mongoose";
export interface IUser {
  id: number;
  username: string;
  password?: string;
  status: StatusAccount;
  roleName: string;
  createdAt: Date;
  updatedAt: Date;
  posts: Document[]
}

export interface CreateUserRequest {
  username: string;
  password: string;
  roleName: string;
}

export interface UpdateUserRequest {
  username: string;
  status: StatusAccount;
  roleName: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface UserRequestQuery{
  currentPage?: number;
  size?: number;
  roleName?: string;
  status?: StatusAccount;
}

export type UserCollection = Document & IUser