export interface IPost{
    id: string,
    title: string,
    description: string,
    creator: number,
    createdAt: Date,
    updatedAt: Date,
    status: number
}

export interface CreatePostRequest{
    title: string,
    description: string,
    creator: number
}

export interface UpdatePostRequest{
    id: string,
    title: string,
    description: string,
}

export interface PostRequestQuery{
    currentPage?: number;
    size?: number;
  }