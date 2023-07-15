import mongoose, { Document, model } from "mongoose";
import { ModelName } from "../types/constants";
const { Schema } = mongoose;
const { Posts, Users, PostCategories } = ModelName;

const postSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    creator: { type: mongoose.Types.ObjectId, required: true, ref: Users },
    status: { type: String, required: true },
    feedback: { type: String, required: false },
    approver: { type: mongoose.Types.ObjectId, required: false, ref: Users },
    category: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: PostCategories,
    },
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

export const PostModel = model(Posts, postSchema);
