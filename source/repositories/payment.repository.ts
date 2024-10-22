import { IPaymentDocument } from "../interfaces/payment.interface";
import { db } from "../util/prisma";
class PaymentRepository {
    // Create Payment
    // This function creates a new Payment with the given data
    public async create({
        name,
        amount,
        isActive,
        userId,
    }: {
        name: string;
        amount: number;
        isActive: boolean;
        userId: string;
    }): Promise<IPaymentDocument> {

        // Save the Payment to the database
        return await db.payment.create({
            data:{
                name,
                amount,
                isActive,
                userId
            }
        }) as any;
    }

    // Function to get a Payment document by email
    // @param {Object} - An object containing the email and an optional leanVersion boolean
    // @returns {Promise<IPaymentDocument | null>} - A promise that resolves with a Payment document or null if not found
    public async getOne(query:any): Promise<IPaymentDocument | null> {
        // Query the Payment model for a document with the given email
        return db.payment.findUnique(query) as any;
    }

    // Function to get a Payment document by email
    // @param {Object} - An object containing the email and an optional leanVersion boolean
    // @returns {Promise<IPaymentDocument | null>} - A promise that resolves with a Payment document or null if not found
    public async get(query:any): Promise<IPaymentDocument | null> {
        // Query the Payment model for a document with the given email
        return db.payment.findMany(query) as any;
    }

    public async atomicUpdate(
        query: any,
        record: any,
    ): Promise<IPaymentDocument | null> {
        return await db.payment.update(
            {
                where: query,
                data: record,
            }
        ) as any;
    }

    public async delete(
        query: any,
    ): Promise<IPaymentDocument | null> {

        return await db.payment.delete(
            {
                where: query,
            }
        ) as any;
    }
}

export default new PaymentRepository();
