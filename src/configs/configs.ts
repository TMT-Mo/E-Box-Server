import dotenv from "dotenv";
import { Config } from "../types/configs";

dotenv.config();
export const getConfigs = (): Config => {
  return {
    MONGO_URL: process.env.MONGO_URL,
    PORT: process.env.PORT as unknown as number,
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
    CLIENT_HOST: process.env.CLIENT_HOST,
  };
};
//
