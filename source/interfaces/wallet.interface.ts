// An enum containing wallet statuses
export enum WALLET_STATUS {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

// Create an interface to represent Wallet data structure
export interface IWallet {
    // Field for Wallet ID
    id: string;
    // Field for Wallet userData
    userData: any;
    walletAccountNumber: string;
    balance: number;
    currency: string;
    totalCreditTransactions: number;
    userId: string;
    status: WALLET_STATUS;
  }

  // Create an interface which combines Document and IOtp interface
  export interface IWalletDocument extends IWallet {}
