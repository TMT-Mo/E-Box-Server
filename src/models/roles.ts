import mongoose, { Document, model } from "mongoose";
import { ModelName } from "../types/constants";
const { Schema } = mongoose;
const { Roles } = ModelName;

const roleSchema = new Schema(
  {
    name: { type: String, required: true },
    status: { type: String, required: true },
  },
  {
    toJSON: {
      transform: function (doc: Document, ret: any) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
    timestamps: true,
  }
);

export const RoleModel = model(Roles, roleSchema);
