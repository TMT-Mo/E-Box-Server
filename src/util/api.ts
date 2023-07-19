export const apis = {
  user: {
    head: "/api/user",
    getUserList: "/getUserList",
    getUserById: "/getUserById",
    createUser: "/createUser",
    login: "/login",
    refreshToken: "/refreshToken",
    updateUser: "/updateUser",
  },
  post: {
    head: "/api/post",
    getPostList: "/getPostList",
    createPost: "/createPost",
    createCategory: "/createCategory",
    updatePost: "/updatePost",
    getCategoryList: "/getCategoryList",
  },
  activity: {
    head: "/api/activity",
    getActivityList: "/getActivityList",
    getActivityById: "/getActivityById",
    saveActivity: "/saveActivity",
  },
  role: {
    head: "/api/role",
    getRoleList: "/getRoleList",
    createRole: "/createRole",
  },
  comment: {
    head: "/api/comment",
    getCommentList: "/getCommentList",
    createComment: "/createComment",
  },
};
