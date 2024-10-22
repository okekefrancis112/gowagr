import { Worker } from "bullmq";
import redis from "../../config/redis.config";
import notificationRepository from "../../repositories/notification.repository";


export const NotificationTaskConsumer = () => {
    const worker = new Worker(
        "notification-queue",
        async (job) => {
            const {
                notificationCategory,
                userId,
                title,
                content,
                actionLink,
            } = job.data;
            await notificationRepository.create({
                userId,
                title,
                notificationCategory,
                content,
                actionLink,
            });
        },
        { connection: redis.redis_config }
    );

    worker.on("completed", (job) => {
        console.log(
            `Notification task with job ID of ${job.id} has completed!`
        );
    });

    worker.on("failed", (job, err) => {
        console.log(
            `Notification task with job ID of ${job?.id} has failed with ${err.message}`
        );
    });
};