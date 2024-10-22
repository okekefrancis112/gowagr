import { ICommentDocument } from "../interfaces/comment.interface";
import { db } from "../util/prisma";
class CommentRepository {
    // Create Comment
    // This function creates a new Comment with the given data
    public async create({
        body,
        postId,
        authorId,
    }: {
        body: string;
        postId: string;
        authorId: string;
    }): Promise<ICommentDocument> {

        // Save the Comment to the database
        return await db.comment.create({
            data:{
                body,
                postId,
                authorId,
            }
        }) as any;
    }

    // Function to get a Comment document by email
    // @param {Object} - An object containing the email and an optional leanVersion boolean
    // @returns {Promise<ICommentDocument | null>} - A promise that resolves with a Comment document or null if not found
    public async getOne(query:any): Promise<ICommentDocument | null> {
        // Query the Comment model for a document with the given email
        return db.comment.findUnique(query) as any;
    }

    // Function to get a Comment document by email
    // @param {Object} - An object containing the email and an optional leanVersion boolean
    // @returns {Promise<ICommentDocument | null>} - A promise that resolves with a Comment document or null if not found
    public async get(query:any): Promise<ICommentDocument | null> {
        // Query the Comment model for a document with the given email
        return db.comment.findMany(query) as any;
    }

    public async atomicUpdate(
        query: any,
        record: any,
    ): Promise<ICommentDocument | null> {
        return await db.comment.update(
            {
                where: query,
                data: record,
            }
        ) as any;
    }

    public async delete(
        query: any,
    ): Promise<ICommentDocument | null> {

        return await db.comment.delete(
            {
                where: query,
            }
        ) as any;
    }
}

export default new CommentRepository();
