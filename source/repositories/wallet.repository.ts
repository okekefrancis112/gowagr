import { IWalletDocument } from "../interfaces/wallet.interface";
import { db } from "../util/prisma";
class WalletRepository {
    // Create Wallet
    // This function creates a new Wallet with the given data
    public async create({
        userData,
        walletAccountNumber,
        currency,
        balance,
        userId,
    }: {
        userData: any;
        walletAccountNumber: string;
        balance: number;
        currency: string;
        userId: string;
    }): Promise<IWalletDocument> {

        // Save the Wallet to the database
        return await db.wallet.create({
            data:{
                userData,
                walletAccountNumber,
                currency,
                balance,
                userId
            }
        }) as any;
    }

    // Function to get a Wallet document by email
    // @param {Object} - An object containing the email and an optional leanVersion boolean
    // @returns {Promise<IWalletDocument | null>} - A promise that resolves with a Wallet document or null if not found
    public async getOne(query:any): Promise<IWalletDocument | null> {
        // Query the Wallet model for a document with the given email
        return db.wallet.findUnique(query) as any;
    }

    // Function to get a Wallet document by email
    // @param {Object} - An object containing the email and an optional leanVersion boolean
    // @returns {Promise<IWalletDocument | null>} - A promise that resolves with a Wallet document or null if not found
    public async get(query:any): Promise<IWalletDocument | null> {
        // Query the Wallet model for a document with the given email
        return db.wallet.findMany(query) as any;
    }

    public async atomicUpdate(
        query: any,
        record: any,
    ): Promise<IWalletDocument | null> {
        return await db.wallet.update(
            {
                where: query,
                data: record,
            }
        ) as any;
    }

    public async delete(
        query: any,
    ): Promise<IWalletDocument | null> {

        return await db.wallet.delete(
            {
                where: query,
            }
        ) as any;
    }

    public async processWalletCreditUpdates({
        userId,
        amount,
        balance,
        // session,
    }: {
        userId: String;
        amount: number;
        balance: number;
        // session: any;
    }): Promise<IWalletDocument | null> {
        return this.atomicUpdate(
            { id: userId },
            {
                balance: { increment: amount },
                total_credit_transactions: { increment: amount },
                no_of_credit_transactions: { increment: 1 },
                balance_before: balance,
                balance_after: balance + amount,
                last_deposit_amount: amount,
                last_deposit_date: new Date(),
            },
        );
    }

    public async processWalletDebitUpdates({
        userId,
        amount,
        balance,
        // session,
    }: {
        userId: String;
        amount: number;
        balance: number;
        // session: any;
    }): Promise<IWalletDocument | null> {
        return this.atomicUpdate(
            { id: userId },
            {
                balance: { decrement: amount },
                total_debit_transactions: { increment: amount },
                no_of_debit_transactions: { increment: 1 },
                balance_before: balance,
                balance_after: balance - amount,
                last_debit_amount: amount,
                last_debit_date: new Date(),
            },
        );
    }

}

export default new WalletRepository();
