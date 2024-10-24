// enum of possible transaction types (credit/debit)
export enum ITransactionType {
  CREDIT = "credit",
  DEBIT = "debit",
}

// enum of possible transaction status (successful/failure)
export enum ITransactionStatus {
  SUCCESSFUL = "successful",
  FAILURE = "failure",
}

export enum ICurrency {
  NGN = "NGN",
  USD = "USD",
}

// Create an interface to represent Transaction data structure
export interface ITransaction {
    // Field for Transaction ID
    id: string;
    // Field for Transaction name
    currency: ICurrency;
    transactionType: ITransactionType;
    amount: number;
    description: string;
    paymentReference?: string;
    senderId?: string;
    receiverId?: string;
    paymentId?: string;
    note?: string;
    isPaid?: boolean;
    transactionStatus: ITransactionStatus;
  }

  // Create an interface which combines Document and IOtp interface
  export interface ITransactionDocument extends ITransaction {}
