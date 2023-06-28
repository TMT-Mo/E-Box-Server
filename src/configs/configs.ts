import dotenv from "dotenv";
import { Config } from "../types/configs";

dotenv.config()
export const getConfigs = (): Config => {
  return { MONGO_URL: process.env.MONGO_URL };
};
// 