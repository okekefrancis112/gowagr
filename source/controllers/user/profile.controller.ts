import { Response } from "express";
import { ExpressRequest } from "../../server";
import { UploadedFile } from "express-fileupload";
import bcryptjs from "bcryptjs";
import UtilFunctions, { throwIfUndefined } from "../../util";
import ResponseHandler from "../../util/response-handler";
import userRepository from "../../repositories/user.repository";
import {
    HTTP_CODES,
} from "../../constants/app_defaults.constant";
import ImageService from "../../services/image.service";

/*****
 *
 *
 * Get User Profile
 */
export async function getUserProfile(
    req: ExpressRequest,
    res: Response
): Promise<Response | void> {
    try {
        const user = throwIfUndefined(req.user, "req.user");

        const getUser = await userRepository.getOne({
            where: { id: user.id },
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
                accepted_terms_conditions: true,
                is_disabled: true,
                verified_email: true,
                verified_email_at: true,
            },
        });

        if (!getUser) {
            return ResponseHandler.sendErrorResponse({
                res,
                code: HTTP_CODES.NOT_FOUND,
                error: "User not found. Please check your input.",
            });
        }

        return ResponseHandler.sendSuccessResponse({
            res,
            code: HTTP_CODES.OK,
            message: "Your profile has been successfully retrieved.",
            data: getUser,
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
 * Upload Profile Image
 */

export async function uploadProfileImage(
    req: ExpressRequest,
    res: Response
): Promise<Response | void> {
    try {
        const user = throwIfUndefined(req.user, "req.user");
        const getUser = await userRepository.getOne({ where: { id: user.id } });
        const user_profile_image = getUser?.image!;

        const { files } = req;

        if (files && files?.profile_photo) {
            if (user_profile_image) {
                await ImageService.deleteImageFromS3(user_profile_image);
            }

            const profile_photo = files.profile_photo as UploadedFile;

            const validateFileResult = await UtilFunctions.validateUploadedFile(
                {
                    file: profile_photo,
                }
            );

            if (!validateFileResult.success) {
                return ResponseHandler.sendErrorResponse({
                    code: HTTP_CODES.BAD_REQUEST,
                    error: validateFileResult.error as string,
                    res,
                });
            }

            const upload_image = await ImageService.linkImageToUserProfile(
                profile_photo,
                user.id
            );

            return ResponseHandler.sendSuccessResponse({
                res,
                code: HTTP_CODES.CREATED,
                message: "Your profile image has been successfully uploaded.",
                data: upload_image,
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

/****
 *
 *
 * Edit Profile
 */

export async function editProfile(
    req: ExpressRequest,
    res: Response
): Promise<Response | void> {
    try {
        const userId = throwIfUndefined(req.user, "req.user").id;
        const {
            fullname,
            username,
            email,
            location,
            image,
            country,
            role,
            bio,
            dob,
            interests,
        } = req.body;


        const user = await userRepository.atomicUpdate(
            {id: userId },
            {
                // accepted_terms_conditions: true,
                email,
                fullname,
                username,
                image,
                bio,
                location,
                country,
                tags:{
                    connect: interests.map((id:any) => ({
                      id: id.id,
                    })),
                  },
                dob,
                role,
            }
        );

        return ResponseHandler.sendSuccessResponse({
            res,
            code: HTTP_CODES.OK,
            message: "Your details have been successfully updated.",
            data: user,
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
 * Change Password
 */

export async function changePassword(
    req: ExpressRequest,
    res: Response
): Promise<Response | void> {
    try {
        const userId = throwIfUndefined(req.user, "req.user").id;

        const { current_password, new_password, confirm_password } = req.body;

        const user = await userRepository.getOne({ where: { id: userId } });

        if (!user) {
            return ResponseHandler.sendErrorResponse({
                res,
                code: HTTP_CODES.NOT_FOUND,
                error: `User not found. Please check your input.`,
            });
        }

        const result = bcryptjs.compareSync(current_password, user?.password!);

        if (!result) {
            return ResponseHandler.sendErrorResponse({
                res,
                code: HTTP_CODES.NOT_FOUND,
                error: "Incorrect password. Please try again.",
            });
        }

        if (new_password !== confirm_password) {
            return ResponseHandler.sendErrorResponse({
                res,
                code: HTTP_CODES.BAD_REQUEST,
                error: `Your passwords do not match. Please check and try again.`,
            });
        }

        const password = bcryptjs.hashSync(new_password, 10);

        await userRepository.atomicUpdate({ id: user.id },
            { password: password },
        );

        return ResponseHandler.sendSuccessResponse({
            res,
            code: HTTP_CODES.CREATED,
            message: "Success! Your password has been updated.",
        });
    } catch (error) {
        return ResponseHandler.sendErrorResponse({
            res,
            code: HTTP_CODES.INTERNAL_SERVER_ERROR,
            error: `${error}`,
        });
    }
}

/*******************
 *
 * Soft Delete Account
 *
 */

export async function softDeleteAccount(
    req: ExpressRequest,
    res: Response
): Promise<Response | void> {
    try {
        const userId = throwIfUndefined(req.user, "req.user").id;
        const user = await userRepository.getOne({ where: { id: userId }, });

        if (!user) {
            return ResponseHandler.sendErrorResponse({
                res,
                code: HTTP_CODES.NOT_FOUND,
                error: `User not found. Please check your input.`,
            });
        }

        await userRepository.atomicUpdate(
            { id: user.id },
            { is_deleted: true, is_deleted_at: new Date() }
        );

        return ResponseHandler.sendSuccessResponse({
            res,
            code: HTTP_CODES.CREATED,
            message: `Your account has been successfully deleted.`,
        });
    } catch (error) {
        return ResponseHandler.sendErrorResponse({
            res,
            code: HTTP_CODES.INTERNAL_SERVER_ERROR,
            error: `${error}`,
        });
    }
}
