import bcrypt from "bcrypt";
import { IAdminUserDocument } from "../interfaces/adminUser.interface";
import { db } from "../util/prisma";

class AdminUserRepository {
    // Create Admin User
    public async create({
        email,
        role,
    }: {
        email: string;
        role: string;
    }): Promise<IAdminUserDocument> {
        const data: any = {
            email,
            role,
        };

        const res = await db.admin.create({
            data: data,
        });
        return res as any;
    }

    // Create Admin User
    public async createFullAdmin({
        fullname,
        username,
        password,
        email,
        roles,
        verified_email,
        verified_email_at,
    }: {
        fullname?: string;
        username?: string;
        password?: string;
        email: string;
        roles?: any;
        verified_email?: boolean;
        verified_email_at?: Date;
    }): Promise<IAdminUserDocument> {
        const data: any = {
            fullname,
            username,
            password,
            email,
            roles,
            verified_email,
            verified_email_at,
        };
        if (password) {
            const salt = await bcrypt.genSalt(parseInt("10"));
            const hash = await bcrypt.hash(password, salt);

            data.password = hash;
        }
        const res = await db.admin.create({
            data: data,
        });
        return res as any;
    }

    // Get Admin By Query
    public async getOne(
        query:any
      ): Promise<IAdminUserDocument | null> {
        console.log(query);
        return db.admin.findUnique(query) as any;
      }

    // Function to get a user document by email
    // @param {Object} - An object containing the email and an optional leanVersion boolean
    // @returns {Promise<IUserDocument | null>} - A promise that resolves with a user document or null if not found
    public async get(query:any): Promise<IAdminUserDocument | null> {
        // Query the User model for a document with the given email
        const res:any = db.admin.findMany(query);
        return res;
    }

    // Update Admin User information
    public async atomicUpdate(
        query: any,
        record: any,
    ): Promise<IAdminUserDocument | null> {
        const res = await db.admin.update(
            {
                where: query,
                data: record,
            }
        );

        return res as any;
    }
}

// Export AdminUserRepository
export default new AdminUserRepository();
