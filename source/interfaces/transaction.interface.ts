// Create an interface to represent Transaction data structure
export interface ITransaction {
    // Field for Transaction ID
    id: string;
    // Field for Transaction name
    currency: string;
    amount: number;
    senderId?: string;
    receiverId?: string;
    paymentId?: string;
    remarks?: string;
    isPaid?: boolean;
  }

  // Create an interface which combines Document and IOtp interface
  export interface ITransactionDocument extends ITransaction {}
