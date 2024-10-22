import { Response } from "express";
import bcryptjs from "bcryptjs";
import { ExpressRequest } from "../../server";
import UtilFunctions, { throwIfUndefined } from "../../util";
import ResponseHandler from "../../util/response-handler";
import { APP_CONSTANTS, HTTP_CODES } from "../../constants/app_defaults.constant";
import otpRepository from "../../repositories/otp.repository";
import userRepository from "../../repositories/user.repository";
import { UploadedFile } from "express-fileupload";
import ImageService from "../../services/image.service";
import { db } from "../../util/prisma";
import walletRepository from "../../repositories/wallet.repository";


/***
 *
 *
 * Register User Mobile (Without Captcha)
 */
export async function Register(
    req: ExpressRequest,
    res: Response
): Promise<Response | void> {
    const {
        fullname,
        username,
        email,
        country,
        password,
        confirmPassword,
        dob,
    } = req.body;

    try {
        // Start a Prisma transaction
        await db.$transaction(async () => {

        // try to get an existing user by their email address
        const existingUser = await userRepository.getOne({
            where: { email: email.toLowerCase() },
        });

        if (existingUser && existingUser.is_deleted) {
            return ResponseHandler.sendErrorResponse({
                res,
                code: HTTP_CODES.NOT_FOUND,
                error: `This email address belongs to a deleted account. Please contact support for assistance.`,
            });
        }

        // if a matching user exists, return a conflict response
        if (existingUser) {
            return ResponseHandler.sendErrorResponse({
                res,
                code: HTTP_CODES.CONFLICT,
                error: `This email is already taken`,
            });
        }

        // check if the passwords match
        if (confirmPassword && password !== confirmPassword) {
            return ResponseHandler.sendErrorResponse({
                res,
                code: HTTP_CODES.BAD_REQUEST,
                error: `Passwords do not match`,
            });
        }

        const salt = await bcryptjs.genSalt(parseInt("10"));
        const hash = await bcryptjs.hash(password, salt);

        // create the user in the database
        const user = await userRepository.create({
            fullname,
            username,
            email,
            country,
            password: hash,
            dob: new Date(dob),
        });

        // Create a prisma object reference
        const userId = user.id;
        const walletAccountNumber = await UtilFunctions.generateWalletAccountNumber();

        const walletPayload = {
            userId: userId,
            userData: {
                fullname: fullname ? fullname.trim() : "",
                email: email ? email.trim() : "",
            },
            walletAccountNumber: walletAccountNumber,
            currency: "NGN",
            balance: 0,
        };
        const wallet = await walletRepository.create(walletPayload);

        if (wallet) {
            // generate a one-time-password for email verification
            const otp = await UtilFunctions.generateOtp({ userId });

            // create an instance of current date/time
            const createdAt = new Date();

            // send a verification email to the user
            await UtilFunctions.sendEmail2("verify.hbs", {
                to: email,
                subject: "Transactly account verification OTP",
                props: {
                    email,
                    otp: otp?.otp,
                    name: user.username,
                    createdAt,
                },
            });

            // send a welcome email to the user
            await UtilFunctions.sendEmail2("welcome.hbs", {
                to: email,
                subject: "Welcome to Transactly",
                props: {
                    name: username,
                },
            });

            // return success response after successful user creation
            return ResponseHandler.sendSuccessResponse({
                message: `Verification email sent! Please check your inbox`,
                code: HTTP_CODES.CREATED,
                res,
            });
        }
        });
    } catch (error) {
        return ResponseHandler.sendErrorResponse({
            res,
            code: HTTP_CODES.INTERNAL_SERVER_ERROR,
            error: `${error}`,
        });
    }
}


/******
 *
 *
 * Verify Email
 */

export async function VerifyEmail(
    req: ExpressRequest,
    res: Response
): Promise<Response | void> {
    const { email, otp } = req.body;
    try {
        const user = await userRepository.getOne({
            where: { email: email.toLowerCase() },
        });

        if (!user) {
            return ResponseHandler.sendErrorResponse({
                res,
                code: HTTP_CODES.NOT_FOUND,
                error: "This email address is not registered on Transactly."
            });
        }

        if (user.verified_email) {
            return ResponseHandler.sendErrorResponse({
                res,
                code: HTTP_CODES.CONFLICT,
                error: "Your email address has already been verified"
            });
        }

        if (user.is_disabled) {
            return ResponseHandler.sendErrorResponse({
                res,
                code: HTTP_CODES.FORBIDDEN,
                error: "This account has been disabled"
            });
        }

        const verifyOtp = await otpRepository.verifyOtp({
            otp,
            userId: user.id,
        });

        if (!verifyOtp.status) {
            return ResponseHandler.sendErrorResponse({
                res,
                code: HTTP_CODES.BAD_REQUEST,
                error: verifyOtp.message,
            });
        }

        const token = await UtilFunctions.generateToken({
            id: user.id,
            user_name: user.username,
            email: user.email,
        });

        await userRepository.atomicUpdate(
            { id: user.id },
            {
                first_login: true,
                last_login: new Date(),
                verified_email: true,
                verified_email_at: new Date(),
            }
        );

        const data = {
            token,
            ...user,
        };

        return ResponseHandler.sendSuccessResponse({
            res,
            code: HTTP_CODES.CREATED,
            message: "Your email verification is successful!",
            data,
        });
    } catch (error) {
        return ResponseHandler.sendErrorResponse({
            res,
            code: HTTP_CODES.INTERNAL_SERVER_ERROR,
            error: `${error}`,
        });
    }
}

/***
 *
 *
 * Resend Verification
 */
export async function resendVerification(
    req: ExpressRequest,
    res: Response
): Promise<Response | void> {
    const {
        email,
    }: {
        email: string;
    } = req.body;

    try {
        const user = await userRepository.getOne({
            where: { email: email.toLowerCase() },
        });
        if (!user) {
            return ResponseHandler.sendErrorResponse({
                res,
                code: HTTP_CODES.NOT_FOUND,
                error: `This email address is not registered on Transactly.`,
            });
        }

        if (user.verified_email) {
            return ResponseHandler.sendErrorResponse({
                res,
                code: HTTP_CODES.CONFLICT,
                error: "Your email address has already been verified",
            });
        }

        if (user.is_disabled) {
            return ResponseHandler.sendErrorResponse({
                res,
                code: HTTP_CODES.FORBIDDEN,
                error: "This account has been disabled",
            });
        }

        // Save OTP
        const otp = await UtilFunctions.generateOtp({ userId: user.id });

        let createdAt = new Date();

        await UtilFunctions.sendEmail2("verify.hbs", {
            to: email,
            subject: "Transactly account verification OTP",
            props: {
                email,
                otp: otp?.otp,
                name: user.username,
                createdAt,
            },
        });

        return ResponseHandler.sendSuccessResponse({
            message: `Verification email sent! Please check your inbox`,
            code: HTTP_CODES.CREATED,
            res,
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
 * Login Mobile
 */

// Login function to authenticate user
export async function LoginMobile(
    req: ExpressRequest,
    res: Response
): Promise<Response | void> {
    try {
        const { email, password } = req.body;

        // Get user by email
        const user = await userRepository.getOne({
            where: { email: email.toLowerCase() },
        });

        if (!user) {
            // Return error response if user does not exist
            return ResponseHandler.sendErrorResponse({
                res,
                code: HTTP_CODES.NOT_FOUND,
                error: "This email address is not registered on Transactly.",
            });
        }

        if (user && user.is_deleted) {
            return ResponseHandler.sendErrorResponse({
                res,
                code: HTTP_CODES.NOT_FOUND,
                error: `This email address belongs to a deleted account. Please contact support for assistance.`,
            });
        }

        // Check if user's email is verified
        if (!user.verified_email) {
            return res.status(401).json({
                success: false,
                code: HTTP_CODES.OK,
                message: "Email is not verified yet",
                data: {
                    verified_email: false,
                },
            });
        }

        // Check if user account is disabled
        if (user.is_disabled) {
            return ResponseHandler.sendErrorResponse({
                res,
                code: HTTP_CODES.FORBIDDEN,
                error: "Account blocked, Contact admin: hello@Transactly.co",
            });
        }

        // Compare the passwords
        const result = bcryptjs.compareSync(password, user?.password!);
        if (!result) {
            return ResponseHandler.sendErrorResponse({
                res,
                code: HTTP_CODES.BAD_REQUEST,
                error: "Invalid Password! Please input the correct one.",
            });
        }

        // Generate token
        const token = await UtilFunctions.generateToken({
            id: user.id,
            username: user.username,
            email: user.email,
        });

        // Set first_login to false
        if (user.first_login) {
            await userRepository.atomicUpdate(
                { id: user.id },
                {first_login: false}
            );
        }

        const data = {
            token,
            ...user,
        };

        // Update last_login field in user document
        await userRepository.atomicUpdate(
            { id: user.id },
            {
                last_login: new Date(),
                login_count: {
                    increment: 1,
            },
        });

        return ResponseHandler.sendSuccessResponse({
            res,
            code: HTTP_CODES.OK,
            message: `Welcome back ${user.username}!`,
            data,
        });
    } catch (error) {
        // Return error response if any error occurs
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
 * Recover Email
 */

export async function recover(
    req: ExpressRequest,
    res: Response
): Promise<Response | void> {
    const { email } = req.body;

    try {
        const user = await userRepository.getOne({
            where: { email: email.toLowerCase() },
        });

        if (!user) {
            return ResponseHandler.sendErrorResponse({
                res,
                code: HTTP_CODES.NOT_FOUND,
                error: "This email address is not registered on Transactly.",
            });
        }

        if (user && user.is_deleted) {
            return ResponseHandler.sendErrorResponse({
                res,
                code: HTTP_CODES.NOT_FOUND,
                error: `This email address belongs to a deleted account. Please contact support for assistance.`,
            });
        }

        if (!user.verified_email) {
            return ResponseHandler.sendErrorResponse({
                res,
                code: HTTP_CODES.UNAUTHORIZED,
                error: "This  email address has not been verified.",
            });
        }

        if (user.is_disabled) {
            return ResponseHandler.sendErrorResponse({
                res,
                code: HTTP_CODES.FORBIDDEN,
                error: "Account blocked, Contact admin: hello@Transactly.co",
            });
        }

        // Save OTP
        const otp = await UtilFunctions.generateOtp({ userId: user.id });

        let createdAt = new Date();

        await UtilFunctions.sendEmail2("recover.hbs", {
            to: email,
            subject: "Transactly Password Recovery",
            props: {
                email,
                otp: otp?.otp,
                name: user.username,
                createdAt,
            },
        });

        return ResponseHandler.sendSuccessResponse({
            res,
            code: HTTP_CODES.OK,
            message: "Check your inbox for your reset email.",
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
 * Verify OTP
 */

export async function verifyOtp(
    req: ExpressRequest,
    res: Response
): Promise<Response | void> {
    const { email, otp } = req.body;

    try {
        const user = await userRepository.getOne({
            where: { email: email.toLowerCase() },
        });

        if (!user) {
            return ResponseHandler.sendErrorResponse({
                res,
                code: HTTP_CODES.NOT_FOUND,
                error: "This email address is not registered on Transactly.",
            });
        }

        if (user && user.is_deleted) {
            return ResponseHandler.sendErrorResponse({
                res,
                code: HTTP_CODES.NOT_FOUND,
                error: `This email address belongs to a deleted account. Please contact support for assistance.`,
            });
        }

        if (!user.verified_email) {
            return ResponseHandler.sendErrorResponse({
                res,
                code: HTTP_CODES.UNAUTHORIZED,
                error: "This email address has not been verified.",
            });
        }

        if (user.is_disabled) {
            return ResponseHandler.sendErrorResponse({
                res,
                code: HTTP_CODES.FORBIDDEN,
                error: "Account blocked, Contact admin: hello@Transactly.co",
            });
        }

        const verifyOtp = await otpRepository.verifyOtp({
            otp,
            userId: user.id,
        });

        if (!verifyOtp.status) {
            return ResponseHandler.sendErrorResponse({
                res,
                code: HTTP_CODES.BAD_REQUEST,
                error: verifyOtp.message,
            });
        }

        const token = await UtilFunctions.generateToken({
            id: user.id,
            user_name: user.username,
            email: user.email,
        });

        return ResponseHandler.sendSuccessResponse({
            res,
            code: HTTP_CODES.OK,
            message: "OTP Verification successful.",
            data: token,
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
 * Reset Password
 */

export async function resetPassword(
    req: ExpressRequest,
    res: Response
): Promise<Response | void> {
    const { token, new_password, confirm_password } = req.body;

    try {
        const verify_token: any = await UtilFunctions.verifyToken(token);

        if (!verify_token.status) {
            return ResponseHandler.sendErrorResponse({
                res,
                code: HTTP_CODES.UNAUTHORIZED,
                error: verify_token.error,
            });
        }

        const user = await userRepository.getOne({
            where: { email: verify_token.decoded.email },
        });

        if (!user) {
            return ResponseHandler.sendErrorResponse({
                res,
                code: HTTP_CODES.NOT_FOUND,
                error: "This email address is not registered on Transactly.",
            });
        }

        if (user && user.is_deleted) {
            return ResponseHandler.sendErrorResponse({
                res,
                code: HTTP_CODES.NOT_FOUND,
                error: `This email address belongs to a deleted account. Please contact support for assistance.`,
            });
        }

        if (!user.verified_email) {
            return ResponseHandler.sendErrorResponse({
                res,
                code: HTTP_CODES.UNAUTHORIZED,
                error: "This email address has not been verified",
            });
        }

        if (user.is_disabled) {
            return ResponseHandler.sendErrorResponse({
                res,
                code: HTTP_CODES.FORBIDDEN,
                error: "Account blocked, Contact admin: hello@Transactly.co",
            });
        }

        if (new_password !== confirm_password) {
            return ResponseHandler.sendErrorResponse({
                res,
                code: HTTP_CODES.BAD_REQUEST,
                error: `Your passwords do not match.`,
            });
        }

        const hash = bcryptjs.hashSync(
            new_password,
            APP_CONSTANTS.GENERAL.SALT_ROUNDS
        );

        await userRepository.atomicUpdate(
            { id: user.id },
            { password: hash }
        );

        return ResponseHandler.sendSuccessResponse({
            res,
            code: HTTP_CODES.OK,
            message: "Success! Your password has been changed.",
        });
    } catch (error) {
        return ResponseHandler.sendErrorResponse({
            res,
            code: HTTP_CODES.INTERNAL_SERVER_ERROR,
            error: `${error}`,
        });
    }
}

/*****
 *
 *
 * Get User Details
 */
export async function getUserDetails(
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
        const getUser = await userRepository.getOne({ _id: user.id });
        const user_image = getUser?.image!;

        const { files } = req;

        if (files && files?.profile_photo) {
            if (user_image) {
                await ImageService.deleteImageFromS3(user_image);
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
                data: upload_image?.image,
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

/***
 *
 * Get Users
 *
 */
export async function getUsers(
    req: ExpressRequest,
    res: Response
): Promise<Response | void> {
    try {
        throwIfUndefined(req.user, "req.user");
        const users = await userRepository.getAll(req);

        return ResponseHandler.sendSuccessResponse({
            res,
            code: HTTP_CODES.OK,
            message: "Users fetched successfully",
            data: users,
        });
    } catch (error) {
        return ResponseHandler.sendErrorResponse({
            res,
            code: HTTP_CODES.INTERNAL_SERVER_ERROR,
            error: `${error}`,
        });
    }
}

/***
 *
 * Search Users
 *
 */
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