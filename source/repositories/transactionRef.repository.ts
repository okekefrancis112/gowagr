import { ITransactionRefDocument } from '../interfaces/transactionRef.interface';
import { db } from "../util/prisma";

class TransactionRefRepository {
  // Create Admin TransactionRefs
  public async create({
    transactionHash,
    userId,
    amount,
  }: {
    transactionHash?: string;
    userId?: string;
    amount?: number;
  }): Promise<ITransactionRefDocument> {

    return await db.transactionRefs.create({
      data: {
        transactionHash,
        userId,
        amount,
      }
    })  as any;
  }

  // Get TransactionRef by TransactionRef name
  public async getOne(
    query: any
  ): Promise<ITransactionRefDocument | null> {
    return db.transactionRefs.findUnique(query) as any;
  }

  // Function to get a user document by email
    // @param {Object} - An object containing the email and an optional leanVersion boolean
    // @returns {Promise<IUserDocument | null>} - A promise that resolves with a user document or null if not found
    public async get(query:any): Promise<ITransactionRefDocument | null> {
      // Query the User model for a document with the given email
      return db.transactionRefs.findMany(query) as any;
  }

  // Update TransactionRef by id
  public async atomicUpdate(
    query: any,
    record: any,
    ): Promise<ITransactionRefDocument | null> {
    return await db.transactionRefs.update(
      {
          where: query,
          data: record,
      }
    ) as any;
  }

  // Delete TransactionRef by query
  public async delete(query: any): Promise<ITransactionRefDocument | null> {
    return await db.transactionRefs.delete(
      {
          where: query,
      }
    ) as any;
  }

}

// Export TransactionRefRepository
export default new TransactionRefRepository();
