import { IPostDocument } from "../interfaces/post.interface";
import { db } from "../util/prisma";
import { repoPagination } from "../util";
class PostRepository {
    // Create post
    // This function creates a new post with the given data
    public async create({
        title,
        slug,
        body,
        image,
        location,
        tags,
        userId,
    }: {
        title: string;
        slug: string;
        image?: string;
        body?: string;
        location?: string;
        tags: string[];
        userId: any;
    }): Promise<IPostDocument> {

        // Save the post to the database
        return await db.post.create({
            data:{
                title: title ? title.trim() : "",
                slug,
                image,
                body: body ? body.trim() : "",
                location: location ? location.trim() : "",
                author: {
                    connect: {
                        id: userId
                    }
                },
                tagList: {
                    connect: tags.map((id:any) => ({
                      id: id.id,
                    })),
                  },
            }
        }) as any;
    }

    // Function to get a post document by email
    // @param {Object} - An object containing the email and an optional leanVersion boolean
    // @returns {Promise<IPostDocument | null>} - A promise that resolves with a post document or null if not found
    public async getOne(query:any): Promise<IPostDocument | null> {
        // Query the post model for a document with the given email
        return db.post.findUnique(query) as any;
    }

    // Function to get a post document by email
    // @param {Object} - An object containing the email and an optional leanVersion boolean
    // @returns {Promise<IpostDocument | null>} - A promise that resolves with a post document or null if not found
    public async get(query:any): Promise<IPostDocument | null> {
        // Query the post model for a document with the given email
        return db.post.findMany(query) as any;
    }

    public async getPaginated(req:any): Promise<IPostDocument | null> {
        const { query } = req; // Get the query params from the request object
        const perpage = Number(query.perpage) || 10; // Set the number of records to return
        const page = Number(query.page) || 1; // Set the page number
        const skip = page * perpage - perpage ;
        const take = perpage;
        // Query the post model for a document with the given email
        const posts = await db.post.findMany({
            skip,
            take,
            orderBy: {
                createdAt: 'desc',
            },
        });

        const total = await db.post.count();
        const pagination = repoPagination({ page, perpage, total: total! });

        return { posts, pagination } as any;
    }

    public async atomicUpdate(
        query: any,
        record: any,
    ): Promise<IPostDocument | null> {
        return await db.post.update(
            {
                where: query,
                data: record,
            }
        ) as any;
    }

    public async delete(
        query: any,
    ): Promise<IPostDocument | null> {

        return await db.post.delete(
            {
                where: query,
            }
        ) as any;
    }
}

export default new PostRepository();
