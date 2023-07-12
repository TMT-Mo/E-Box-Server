import { CommonStatus } from "./constants";
import { Document, ObjectId } from "mongoose";
import { IRole } from "./roles";
export interface IUser {
  id: string;
  username: string;
  password?: string;
  status: CommonStatus;
  role: ObjectId | IRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserBody {
  username: string;
  password: string;
  role: string;
}

export interface UpdateUserRequest {
  username: string;
  status: CommonStatus;
  roleName: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface UserRequestQuery {
  currentPage?: number;
  size?: number;
  roleName?: string;
  status?: CommonStatus;
}
export interface GetUserByIdRequest {
  id: string
}

export interface UpdateUserBody extends IUser{
}

export interface ICookies {
  refreshToken?: string;
}

export interface IDecodedUser extends Object{
  id: string;
  username: string;
  role: IRole;
}
