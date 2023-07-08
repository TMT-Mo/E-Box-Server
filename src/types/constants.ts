export enum StatusAccount {
    ACTIVE = 1,
    INACTIVE = 0
}

export enum ModelName{
    Users = 'users',
    Posts = 'posts',
    PostCategories = 'post-categories',
    Activities = 'activities',
}

export enum KEY{
    TOKEN_KEY = 'supersecret',
    REFRESH_TOKEN = 'refreshToken',
    ACCESS_TOKEN = 'accessToken'
}

export enum StatusPost{
    Process = "Process",
    Approved = "Approved",
    Rejected = "Rejected"
}
export enum StatusPostCategory{
    ACTIVE = 1,
    INACTIVE = 0
}
export enum MessageSuccess{
    CreateUser = 'Create user successfully!',
    UpdateUser = 'Update user successfully!',
    CreatePost = "Create post successfully!",

}

export enum MessageFailed{
    UserExisted = "User already existed!",
    HashPassword = 'Hash password unsuccessfully!',
    UserNotExist = "Cannot find user with the provided id.",
    Login = "Wrong username or password! Please try again.",
    AddPost = "Cannot add post!"
}