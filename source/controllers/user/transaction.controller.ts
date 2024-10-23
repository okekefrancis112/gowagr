import { HTTP_CODES } from "../../constants/app_defaults.constant";
import transactionRepository from "../../repositories/transaction.repository";
import { ExpressRequest } from "../../server";
import { throwIfUndefined } from "../../util";
import { db } from "../../util/prisma";
import ResponseHandler from "../../util/response-handler";
import { Response } from "express";

/***
 *
 * Create Transactions
 *
 */
export async function createTransaction(
    req: ExpressRequest,
    res: Response,
): Promise<Response | void> {
    const user = throwIfUndefined(req.user, 'req.user');

    const {
        currency,
        amount,
        receiverId,
        paymentId,
        remarks,
        isPaid,
    } = req.body;

    try{
        // Start a Prisma transaction
        await db.$transaction(async () => {
            const Transaction = await transactionRepository.create({
                currency,
                amount,
                senderId: String(user.id),
                receiverId: String(receiverId),
                paymentId: String(paymentId),
                remarks,
                isPaid,
            });

            // return success response after successful user creation
            return ResponseHandler.sendSuccessResponse({
                message: `Transaction created successfully`,
                code: HTTP_CODES.CREATED,
                res,
                data: Transaction
            });
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
 * Get Transactions
 *
 */
export async function getTransactions(
    req: ExpressRequest,
    res: Response,
): Promise<Response | void> {
    try{
        throwIfUndefined(req.user, 'req.user');
        const Transactions = await transactionRepository.get({ });

        // return success response after successful user creation
        return ResponseHandler.sendSuccessResponse({
            message: `Transaction fetched successfully`,
            code: HTTP_CODES.CREATED,
            res,
            data: Transactions
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
 * Get Transaction
 *
 */
export async function getTransaction(
    req: ExpressRequest,
    res: Response,
): Promise<Response | void> {
    try{
        throwIfUndefined(req.user, 'req.user');
        const transaction = await transactionRepository.getOne({
            where: { id : String(req.params.transaction_id)}
         });

        // return success response after successful user creation
        return ResponseHandler.sendSuccessResponse({
            message: `Single transaction fetched `,
            code: HTTP_CODES.CREATED,
            res,
            data: transaction
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
 * Edit Transactions
 *
 */
export async function editTransaction(
    req: ExpressRequest,
    res: Response,
): Promise<Response | void> {
    const user = throwIfUndefined(req.user, 'req.user');

    const {
        currency,
        userCurrency,
        usdExchangeRate,
        amount,
        receiverId,
        paymentId,
        remarks,
        isPaid,
    } = req.body;

    try{

        const Transaction = await transactionRepository.atomicUpdate(
            { id: String(req.params.transaction_id) },
            {
                currency,
                userCurrency,
                usdExchangeRate,
                amount,
                receiverId,
                paymentId,
                remarks,
                isPaid,
            }
        );

        // return success response after successful user creation
        return ResponseHandler.sendSuccessResponse({
            message: `Transaction edited successfully`,
            code: HTTP_CODES.CREATED,
            res,
            data: Transaction
        });

    } catch(error) {
        return ResponseHandler.sendErrorResponse({
            res,
            code: HTTP_CODES.INTERNAL_SERVER_ERROR,
            error: `${error}`,
        });
    }
}
