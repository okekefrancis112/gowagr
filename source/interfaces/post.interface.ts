// Create an interface to represent Tag data structure
export interface IPost {
    // Field for Post ID
    id: string;
    // Field for Post title
    title: string;
    slug: string;
    location: string;
    description: string;
    createdAt: string;
    updatedAt: string;
  }

  // Create an interface which combines Document and IOtp interface
  export interface IPostDocument extends IPost {}
