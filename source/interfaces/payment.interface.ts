
// Create an interface to represent Payment data structure
export interface IPayment {
    // Field for Payment ID
    id: string;
    // Field for Payment name
    name: string;
    amount: number;
    isActive: boolean;
    userId: string;
    user: string;
  }

  // Create an interface which combines Document and IOtp interface
  export interface IPaymentDocument extends IPayment {}
