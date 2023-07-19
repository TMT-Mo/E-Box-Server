import axios from "axios";
import { apis } from "./api";
import { CustomExpressRequest } from "../types/configs";
import { getConfigs } from "../configs/configs";

export class ResponseList {
  items: any[];
  currentPage: number;
  size: number;
  total: number;

  constructor(
    size: number = 10,
    currentPage: number = 1,
    total: number,
    items: any[] = []
  ) {
    this.items = items;
    this.currentPage = currentPage;
    this.size = size;
    this.total = total;
  }
}

export class Activity {
  title: string;
  description: string;
  creator: string;

  constructor({title, description, creator}) {
    this.creator = creator;
    this.title = title;
    this.description = description;
  }

  saveActivity = async (req: CustomExpressRequest) => {
    const { head, saveActivity } = apis.activity;

    const activity = {
      title: this.title,
      description: this.description,
      creator: this.creator,
    };
    try {
      await axios.post(`${getConfigs().SERVER_HOST}${head}${saveActivity}`, activity, {
        headers: { Authorization: req.headers.authorization },
      });
      return
    } catch (error) {
      console.log(error)
    }
  };
}
