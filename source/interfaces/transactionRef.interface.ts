// Create an interface to represent TransactionRef data structure
export interface ITransactionRef {
    // Field for TransactionRef ID
    id: string;
    // Field for TransactionRef name
    transactionHash?: string;
    userId?: string;
    amount?: number;
  }

  // Create an interface which combines Document and IOtp interface
  export interface ITransactionRefDocument extends ITransactionRef {}
