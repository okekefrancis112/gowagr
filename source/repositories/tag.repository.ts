import bcrypt from "bcrypt";
import { ITagDocument } from "../interfaces/tag.interface";
import { db } from "../util/prisma";
class TagRepository {
    // Create tag
    // This function creates a new tag with the given data
    public async create({
        name,
    }: {
        name: string;
    }): Promise<ITagDocument> {

        // Save the tag to the database
        return await db.tag.create({
            data:{
                name: name ? name.trim() : "",
            }
        });
    }

    // Function to get a tag document by email
    // @param {Object} - An object containing the email and an optional leanVersion boolean
    // @returns {Promise<ItagDocument | null>} - A promise that resolves with a tag document or null if not found
    public async getOne(query:any): Promise<ITagDocument | null> {
        // Query the tag model for a document with the given email
        return db.tag.findUnique(query);
    }

    // Function to get a tag document by email
    // @param {Object} - An object containing the email and an optional leanVersion boolean
    // @returns {Promise<ItagDocument | null>} - A promise that resolves with a tag document or null if not found
    public async get(query:any): Promise<ITagDocument | null> {
        // Query the tag model for a document with the given email
        return db.tag.findMany(query) as any;
    }

    public async atomicUpdate(
        query: any,
        record: any,
    ): Promise<ITagDocument | null> {
        return await db.tag.update(
            {
                where: query,
                data: record,
            }
        );
    }

    public async delete(
        query: any,
    ): Promise<ITagDocument | null> {

        return await db.tag.delete(
            {
                where: query,
            }
        );
    }
}

export default new TagRepository();
