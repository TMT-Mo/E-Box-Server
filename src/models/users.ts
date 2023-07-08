import mongoose, { Document, model } from "mongoose";
import { ModelName } from "../types/constants";
const { Schema } = mongoose;
const { Users, Posts, Activities } = ModelName;

const userSchema = new Schema(
  {
    username: { type: String, require: true },
    password: { type: String, require: true },
    status: { type: Number, require: true },
    roleName: { type: String, require: true },
    createdAt: { type: Date, require: true },
    updatedAt: { type: Date, require: true },
    posts: [{type: mongoose.Types.ObjectId, required: true, ref: Posts }],
    activities: [{type: mongoose.Types.ObjectId, required: true, ref: Activities }]
    
  },
  {
    toJSON: {
      transform: function (doc: Document, ret: any) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v
      },
    },
    timestamps: true
  },
);

export const UserModel = model(Users, userSchema);
