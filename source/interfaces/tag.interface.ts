// Create an interface to represent Tag data structure
export interface ITag {
    // Field for Tag ID
    id: string;
    // Field for Tag name
    name: string;
  }

  // Create an interface which combines Document and IOtp interface
  export interface ITagDocument extends ITag {}
