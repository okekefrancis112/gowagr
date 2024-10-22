import { Queue } from "bullmq";
import redis from "../../config/redis.config";

const redisOption = redis.redis_config;

// notification
const notificationQueue = new Queue("notification-queue", {
    connection: redisOption,
});

export const NotificationTaskJob = async (job: any) => {
    await notificationQueue.add(job.name, job.data, {
        removeOnComplete: true,
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 3000,
        },
    });
};