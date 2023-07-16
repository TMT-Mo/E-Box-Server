export interface IActivity {
  id?: string;
  title: string;
  description: string;
  creator: string;
}

export interface SaveActivityRequest {
  title: string;
  description: string;
}

export interface GetActivityByIdRequest {
  id: string;
}
export interface GetActivityListRequest {
  id?: string;
}
