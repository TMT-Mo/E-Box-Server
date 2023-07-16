import mongoose, { Document, model } from "mongoose";
import { ModelName } from "../types/constants";
const { Schema } = mongoose;
const { Activities, Users } = ModelName;

const activitySchema = new Schema(
  {
    // _id: {type: mongoose.Types.ObjectId, required: false},
    title: { type: String, required: true },
    description: { type: String, required: true },
    creator: {type: mongoose.Types.ObjectId, required: true, ref: Users},
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

export const ActivityModel = model(Activities, activitySchema);
