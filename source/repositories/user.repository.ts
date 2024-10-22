import { IUserDocument } from "../interfaces/user.interface";
import { db } from "../util/prisma";
import { repoPagination, repoSearch } from "../util";
import { ExpressRequest } from "../server";

class UserRepository {
    // Create User
    // This function creates a new user with the given data
    public async create({
        fullname,
        username,
        email,
        country,
        password,
        dob,
    }: {
        fullname: string;
        username: string;
        email: string;
        country?: string;
        password: string;
        dob?: Date;
    }): Promise<IUserDocument> {

        // Save the user to the database
        const res = await db.user.create({
            data:{
                // accepted_terms_conditions: true,
                email: email.trim(),
                fullname: fullname ? fullname.trim() : "",
                username: username ? username.trim() : "",
                password,
                country,
                dob,
            }
        });
        return res as any;
    }

    // Function to get a user document by email
    // @param {Object} - An object containing the email and an optional leanVersion boolean
    // @returns {Promise<IUserDocument | null>} - A promise that resolves with a user document or null if not found
    public async getOne(query:any): Promise<IUserDocument | null> {
        // Query the User model for a document with the given email
        // const res:any = db.user.findUnique(query);
        return db.user.findUnique(query) as any;
    }

    // Function to get a user document by email
    // @param {Object} - An object containing the email and an optional leanVersion boolean
    // @returns {Promise<IUserDocument | null>} - A promise that resolves with a user document or null if not found
    public async get(query:any): Promise<IUserDocument | null> {
        // Query the User model for a document with the given email
        // const res:any = db.user.findMany(query);
        return db.user.findMany(query) as any;
    }

    public async atomicUpdate(
        query: any,
        record: any,
    ): Promise<IUserDocument | null> {
        return await db.user.update(
            {
                where: query,
                data: record,
            }
        ) as any;
    }

    public async countDocs(query: any): Promise<number> {
        return db.user.count({
            where: query,
        });
    }

    public async searchAllUsers(req: ExpressRequest): Promise<IUserDocument[] | null | any> {
        // Get query parameters from request
        const { query } = req;
        const search = String(query.search);
        const perpage = Number(query.perpage) || 10; // Set the number of records to return
        const page = Number(query.page) || 1; // Set the page number
        const skip = page * perpage - perpage ;
        const take = perpage;

        const searching = repoSearch({
            search: search,
            searchArray: ["fullname", "email"],
        });

        const filterQuery = {
            // is_black_listed: false,
            ...searching,
        };

        const users = await db.user.findMany({
            skip,
            take,
            orderBy: {
                createdAt: 'desc',
            },
            where: {
                OR: [
                    {
                      fullname: {
                        contains: search, // Replace `searchTerm` with the search keyword
                        mode: 'insensitive', // Optional: Makes the search case-insensitive
                      },
                    },
                    {
                      email: {
                        contains: search,
                        mode: 'insensitive',
                      },
                    },
                ],
            },
        });

        const total = await this.countDocs(filterQuery);

        const pagination = repoPagination({ page, perpage, total: total! });

        return {
            users,
            pagination,
        };
    }

    public async getAll(req: ExpressRequest): Promise<IUserDocument[] | null | any> {
        // Get query parameters from request
        const { query } = req;
        const search = String(query.search);
        const perpage = Number(query.perpage) || 10; // Set the number of records to return
        const page = Number(query.page) || 1; // Set the page number
        const skip = page * perpage - perpage ;
        const take = perpage;

        const searching = repoSearch({
            search: search,
            searchArray: ["fullname", "email"],
        });

        const filterQuery = {
            // is_black_listed: false,
            ...searching,
        };

        const users = await db.user.findMany({
            skip,
            take,
            orderBy: {
                createdAt: 'desc',
            },
            where: {
                ...filterQuery,
            },
        });

        const total = await this.countDocs(filterQuery);

        const pagination = repoPagination({ page, perpage, total: total! });

        return {
            users,
            pagination,
        };
    }
}

export default new UserRepository();
