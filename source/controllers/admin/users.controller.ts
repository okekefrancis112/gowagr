import { HTTP_CODES } from "../../constants/app_defaults.constant";
import userRepository from "../../repositories/user.repository";
import { ExpressRequest } from "../../server";
import { throwIfAdminUserUndefined } from "../../util";
import ResponseHandler from "../../util/response-handler";
import { Response } from "express";


export async function getUsers(
    req: ExpressRequest,
    res: Response
): Promise<Response | void> {
    try {
        const total = await userRepository.countDocs({ is_black_listed: false });
        const blacklisted = await userRepository.countDocs({ is_black_listed: true });
        const users = await userRepository.getAll(req);

        return ResponseHandler.sendSuccessResponse({
            res,
            code: HTTP_CODES.OK,
            message: "Users fetched successfully",
            data: {
                total,
                blacklisted,
                users,
            },
        });
    } catch (error) {
        return ResponseHandler.sendErrorResponse({
            res,
            code: HTTP_CODES.INTERNAL_SERVER_ERROR,
            error: `${error}`,
        });
    }
}

export async function searchUsers(
    req: ExpressRequest,
    res: Response
): Promise<Response | void> {
    try {
        const users = await userRepository.searchAllUsers(req);

        return ResponseHandler.sendSuccessResponse({
            res,
            code: HTTP_CODES.OK,
            message: "Users fetched successfully",
            data: users
        });
    } catch (error) {
        return ResponseHandler.sendErrorResponse({
            res,
            code: HTTP_CODES.INTERNAL_SERVER_ERROR,
            error: `${error}`,
        });
    }
}

/****
 *
 *
 * Edit User
 */

export async function editUser(
    req: ExpressRequest,
    res: Response
): Promise<Response | void> {
    try {
        const { userId } = req.params;
        const user = await userRepository.getOne({
            id: userId,
        });

        if (!user) {
            return ResponseHandler.sendErrorResponse({
                res,
                code: HTTP_CODES.NOT_FOUND,
                error: "User not found",
            });
        }
        Object.keys(req.body).forEach((e: string) => {
            if (
                req.body[e] === "" ||
                req.body[e] === "null" ||
                req.body[e] === "undefined" ||
                req.body[e] === "Invalid Date" ||
                req.body[e] === "invalid"
            ) {
                delete req.body[e];
            }
        });

        const update_user = await userRepository.atomicUpdate(
            { id: userId },
            {
                ...req.body,
            }
        );

        if (update_user) {
            return ResponseHandler.sendSuccessResponse({
                res,
                code: HTTP_CODES.OK,
                message: "Your details have been successfully updated.",
                data: user,
            });
        }
    } catch (error) {
        return ResponseHandler.sendErrorResponse({
            res,
            code: HTTP_CODES.INTERNAL_SERVER_ERROR,
            error: `${error}`,
        });
    }
}

export async function getUserPersonalInfo(
    req: ExpressRequest,
    res: Response
): Promise<Response | void> {
    try {
        throwIfAdminUserUndefined(
            req.admin_user,
            "req.admin_user"
        );
        const { userId } = req.params;

        if (!userId) {
            return ResponseHandler.sendErrorResponse({
                res,
                code: HTTP_CODES.BAD_REQUEST,
                error: "User ID is required",
            });
        }

        const user = await userRepository.getOne({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                fullname: true,
                username: true,
                image: true,
                bio: true,
                location: true,
                country: true,
                dob: true,
                tags: true,
                accepted_terms_conditions: true,
                is_disabled: true,
                verified_email: true,
                verified_email_at: true,
                is_deleted: true,
                is_deleted_at: true,
                first_login: true,
                last_login: true,
                reset_password_token: true,
                reset_password_expires: true,
                login_count: true,
                createdAt: true,
                updatedAt: true,
              },
         });

        return ResponseHandler.sendSuccessResponse({
            res,
            code: HTTP_CODES.OK,
            message: "User personal info fetched successfully",
            data: {
                user,
            },
        });
    } catch (error) {
        return ResponseHandler.sendErrorResponse({
            res,
            code: HTTP_CODES.INTERNAL_SERVER_ERROR,
            error: `${error}`,
        });
    }
}