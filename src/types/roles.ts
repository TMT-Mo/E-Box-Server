import { CommonStatus } from "./constants";

export interface IRole {
    id: string,
    name: string,
    status: CommonStatus,
    createdAt: Date,
    updatedAt: Date
}

export interface CreateRoleBody {
    name: string,
}

