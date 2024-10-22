// Create an interface to represent Comment data structure
export interface IComment {
    // Field for Comment ID
    id: string;
    // Field for Comment name
    name: string;
    post?: string;
    postId: string;
    author?: string;
    authorId: string;
    body: string;
    likedBy?: string;
    is_deleted?: boolean;
  }

  // Create an interface which combines Document and IOtp interface
  export interface ICommentDocument extends IComment {}
