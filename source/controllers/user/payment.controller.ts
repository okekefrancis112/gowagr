import { HTTP_CODES } from "../../constants/app_defaults.constant";
import { INotificationCategory } from "../../interfaces/notification.interface";
import paymentRepository from "../../repositories/payment.repository";
import { ExpressRequest } from "../../server";
import { NotificationTaskJob } from "../../services/queues/producer.service";
import { link, throwIfUndefined } from "../../util";
import ResponseHandler from "../../util/response-handler";
import { Response } from "express";

/***
 *
 * Create Payments
 *
 */
export async function createPayment(
    req: ExpressRequest,
    res: Response,
): Promise<Response | void> {
    const user = throwIfUndefined(req.user, 'req.user');

    const {
        name,
        amount,
        isActive,
    } = req.body;

    try{
        const Payment = await paymentRepository.create({
            name,
            amount,
            isActive,
            userId: user.id,
        });

        // Notification for to complete kyc
        await NotificationTaskJob({
            name: "User Notification",
            data: {
                userId: user.id,
                title: "Payment Created",
                notificationCategory: INotificationCategory.PAYMENT,
                content: `Your payment request has been created.`,
                action_link: `${link()}`,
            },
        });

        // return success response after successful user creation
        return ResponseHandler.sendSuccessResponse({
            message: `Payment created successfully`,
            code: HTTP_CODES.CREATED,
            res,
            data: Payment
        });

    } catch(error) {
        return ResponseHandler.sendErrorResponse({
            res,
            code: HTTP_CODES.INTERNAL_SERVER_ERROR,
            error: `${error}`,
        });
    }
}

/***
 *
 * Get Payments
 *
 */
export async function getPayments(
    req: ExpressRequest,
    res: Response,
): Promise<Response | void> {
    try{
        const Payments = await paymentRepository.get({ });

        // return success response after successful user creation
        return ResponseHandler.sendSuccessResponse({
            message: `Payment fetched successfully`,
            code: HTTP_CODES.CREATED,
            res,
            data: Payments
        });

    } catch(error) {
        return ResponseHandler.sendErrorResponse({
            res,
            code: HTTP_CODES.INTERNAL_SERVER_ERROR,
            error: `${error}`,
        });
    }
}

/***
 *
 * Get Payment
 *
 */
export async function getPayment(
    req: ExpressRequest,
    res: Response,
): Promise<Response | void> {
    try{
        throwIfUndefined(req.user, 'req.user');
        const payment = await paymentRepository.getOne({
            where: { id : String(req.params.payment_id)}
         });

        // return success response after successful user creation
        return ResponseHandler.sendSuccessResponse({
            message: `Single payment fetched `,
            code: HTTP_CODES.CREATED,
            res,
            data: payment
        });

    } catch(error) {
        return ResponseHandler.sendErrorResponse({
            res,
            code: HTTP_CODES.INTERNAL_SERVER_ERROR,
            error: `${error}`,
        });
    }
}

/***
 *
 * Edit Payments
 *
 */
export async function editPayment(
    req: ExpressRequest,
    res: Response,
): Promise<Response | void> {
    const user = throwIfUndefined(req.user, 'req.user');

    const {
            name,
            amount,
            isActive,
    } = req.body;

    try{

        const Payment = await paymentRepository.atomicUpdate(
            { id: String(req.params.payment_id) },
            {
                name,
                amount,
                isActive,
                userId: user.id,
            }
        );

        return ResponseHandler.sendSuccessResponse({
            message: `Payment edited successfully`,
            code: HTTP_CODES.CREATED,
            res,
            data: Payment
        });

    } catch(error) {
        return ResponseHandler.sendErrorResponse({
            res,
            code: HTTP_CODES.INTERNAL_SERVER_ERROR,
            error: `${error}`,
        });
    }
}
