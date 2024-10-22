import { INotificationDocument } from "../interfaces/notification.interface";
import { db } from "../util/prisma";
class NotificationRepository {
    // Create Notification
    // This function creates a new Notification with the given data
    public async create({
        title,
        notificationCategory,
        content,
        actionLink,
        // status,
        userId
    }: {
        title: string;
        notificationCategory: string;
        content: string;
        actionLink: string;
        // status: string;
        userId: string;
    }): Promise<INotificationDocument> {

        // Save the Notification to the database
        return await db.notification.create({
            data:{
                title,
                notificationCategory,
                content,
                actionLink,
                // status,
                userId
            }
        }) as any;
    }

    // Function to get a Notification document by email
    // @param {Object} - An object containing the email and an optional leanVersion boolean
    // @returns {Promise<INotificationDocument | null>} - A promise that resolves with a Notification document or null if not found
    public async getOne(query:any): Promise<INotificationDocument | null> {
        // Query the Notification model for a document with the given email
        return db.notification.findUnique(query) as any;
    }

    // Function to get a Notification document by email
    // @param {Object} - An object containing the email and an optional leanVersion boolean
    // @returns {Promise<INotificationDocument | null>} - A promise that resolves with a Notification document or null if not found
    public async get(query:any): Promise<INotificationDocument | null> {
        // Query the Notification model for a document with the given email
        return db.notification.findMany(query) as any;
    }

    public async atomicUpdate(
        query: any,
        record: any,
    ): Promise<INotificationDocument | null> {
        return await db.notification.update(
            {
                where: query,
                data: record,
            }
        ) as any;
    }

    public async markAllAsRead(
        query: any,
        record: any,
    ): Promise<INotificationDocument | null> {
        return await db.notification.updateMany(
            {
                where: query,
                // data: record,
                data: { ...record },
            }
        ) as any;
    }

    public async delete(
        query: any,
    ): Promise<INotificationDocument | null> {

        return await db.notification.delete(
            {
                where: query,
            }
        ) as any;
    }

    public async deleteAll(
        query: any,
    ): Promise<INotificationDocument | null> {

        return await db.notification.deleteMany(
            {
                where: query,
            }
        ) as any;
    }
}

export default new NotificationRepository();
