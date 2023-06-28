export enum StatusAccount {
    ACTIVE = 1,
    INACTIVE = 0
}

export enum ModelName{
    Users = 'users',
    Posts = 'posts'
}

export const TOKEN_KEY = 'supersecret'

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