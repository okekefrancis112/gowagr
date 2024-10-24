import { ITransactionDocument } from "../interfaces/transaction.interface";
import { db } from "../util/prisma";
class TransactionRepository {
    // Create Transaction
    // This function creates a new Transaction with the given data
    public async create({
        userId,
        transactionHash,
        currency,
        amount,
        transactionRefId,
        description,
        senderId,
        receiverId,
        paymentId,
        note,
        isPaid,
        transactionStatus,
        paymentReference,
        transactionType,
    }: {
        currency: string;
        userId: string;
        transactionHash?: string;
        amount: number;
        senderId?: string;
        receiverId?: string;
        paymentId?: string;
        note?: string;
        paymentReference?: string;
        isPaid?: boolean;
        description: string;
        transactionRefId: string;
        transactionStatus: string;
        transactionType: string;
    }): Promise<ITransactionDocument> {
        // Save the Transaction to the database
        return await db.transaction.create({
            data:{
                userId,
                currency,
                amount,
                senderId,
                receiverId,
                paymentId,
                transactionHash,
                note,
                isPaid,
                transactionRefId,
                transactionStatus,
                description,
                paymentReference,
                transactionType,
            }
        }) as any;
    }

    // Function to get a Transaction document by email
    // @param {Object} - An object containing the email and an optional leanVersion boolean
    // @returns {Promise<ITransactionDocument | null>} - A promise that resolves with a Transaction document or null if not found
    public async getOne(query:any): Promise<ITransactionDocument | null> {
        // Query the Transaction model for a document with the given email
        return db.transaction.findUnique(query) as any;
    }

    // Function to get a Transaction document by email
    // @param {Object} - An object containing the email and an optional leanVersion boolean
    // @returns {Promise<ITransactionDocument | null>} - A promise that resolves with a Transaction document or null if not found
    public async get(query:any): Promise<ITransactionDocument | null> {
        // Query the Transaction model for a document with the given email
        return db.transaction.findMany(query) as any;
    }

    public async atomicUpdate(
        query: any,
        record: any,
    ): Promise<ITransactionDocument | null> {
        return await db.transaction.update(
            {
                where: query,
                data: record,
            }
        ) as any;
    }

    public async delete(
        query: any,
    ): Promise<ITransactionDocument | null> {

        return await db.transaction.delete(
            {
                where: query,
            }
        ) as any;
    }
}

export default new TransactionRepository();
