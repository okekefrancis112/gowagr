import request from 'supertest';
import { Response } from 'express';
import bcryptjs from 'bcryptjs';
import { ExpressRequest } from "../server";
import * as userController from "../controllers/user/user.controller";
import UtilFunctions from "../util";
import ResponseHandler from "../util/response-handler";
import { APP_CONSTANTS, HTTP_CODES } from "../constants/app_defaults.constant";
import otpRepository from "../repositories/otp.repository";
import userRepository from "../repositories/user.repository";

jest.mock('bcryptjs');
jest.mock('../util');
jest.mock('../repositories/user.repository');
jest.mock('../repositories/otp.repository');
jest.mock('../util/response-handler');

describe('User Controller', () => {
    // let req: Partial<ExpressRequest>;
    let req: any;
    // let res: Partial<Response>;
    let res: any;

    beforeEach(() => {
        req = {
            body: {},
            headers: {},
            connection: {
                remoteAddress: '127.0.0.1',
            } as any,
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('RegisterMobile', () => {
        it('should return conflict if email is already taken', async () => {
            req.body = {
                fullname: 'John Doe',
                username: 'johndoe',
                email: 'test@example.com',
                location: 'Location',
                country: 'Country',
                password: 'password123',
                confirmPassword: 'password123',
                dob: new Date(),
            };

            (userRepository.getOne as jest.Mock).mockResolvedValue({});

            await userController.Register(req as ExpressRequest, res as Response);

            expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith({
                res,
                code: HTTP_CODES.CONFLICT,
                error: 'This email is already taken',
            });
        });

        it('should return bad request if passwords do not match', async () => {
            req.body = {
                fullname: 'John Doe',
                username: 'johndoe',
                email: 'test@example.com',
                location: 'Location',
                country: 'Country',
                password: 'password123',
                confirmPassword: 'password124',
                dob: new Date(),
            };

            await userController.Register(req as ExpressRequest, res as Response);

            expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith({
                res,
                code: HTTP_CODES.BAD_REQUEST,
                error: 'Passwords do not match',
            });
        });

        it('should create a new user and send verification email', async () => {
            req.body = {
                fullname: 'John Doe',
                username: 'johndoe',
                email: 'test@example.com',
                location: 'Location',
                country: 'Country',
                password: 'password123',
                confirmPassword: 'password123',
                dob: new Date(),
            };

            (userRepository.getOne as jest.Mock).mockResolvedValue(null);
            (bcryptjs.genSalt as jest.Mock).mockResolvedValue('salt');
            (bcryptjs.hash as jest.Mock).mockResolvedValue('hashedPassword');
            (userRepository.create as jest.Mock).mockResolvedValue({ id: 'userId' });
            (UtilFunctions.generateOtp as jest.Mock).mockResolvedValue({ otp: '123456' });

            await userController.Register(req as ExpressRequest, res as Response);

            expect(userRepository.create).toHaveBeenCalledWith({
                fullname: 'John Doe',
                username: 'johndoe',
                email: 'test@example.com',
                location: 'Location',
                country: 'Country',
                password: 'hashedPassword',
                dob: req.body.dob,
            });

            expect(UtilFunctions.sendEmail2).toHaveBeenCalledTimes(2);
            expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith({
                message: 'Verification email sent! Please check your inbox',
                code: HTTP_CODES.CREATED,
                res,
            });
        });

        it('should handle internal server error', async () => {
            req.body = {
                fullname: 'John Doe',
                username: 'johndoe',
                email: 'test@example.com',
                location: 'Location',
                country: 'Country',
                password: 'password123',
                confirmPassword: 'password123',
                dob: new Date(),
            };

            (userRepository.getOne as jest.Mock).mockRejectedValue(new Error('Internal Server Error'));

            await userController.Register(req as ExpressRequest, res as Response);

            expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith({
                res,
                code: HTTP_CODES.INTERNAL_SERVER_ERROR,
                error: 'Error: Internal Server Error',
            });
        });
    });

    describe('VerifyEmail', () => {
        it('should return not found if email is not registered', async () => {
            req.body = { email: 'test@example.com', otp: '123456' };
            (userRepository.getOne as jest.Mock).mockResolvedValue(null);

            await userController.VerifyEmail(req as ExpressRequest, res as Response);

            expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith({
                res,
                code: HTTP_CODES.NOT_FOUND,
                error: 'This email address is not registered on Transactly.',
            });
        });

        it('should return conflict if email is already verified', async () => {
            req.body = { email: 'test@example.com', otp: '123456' };
            (userRepository.getOne as jest.Mock).mockResolvedValue({ verified_email: true });

            await userController.VerifyEmail(req as ExpressRequest, res as Response);

            expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith({
                res,
                code: HTTP_CODES.CONFLICT,
                error: 'Your email address has already been verified',
            });
        });

        it('should return forbidden if account is disabled', async () => {
            req.body = { email: 'test@example.com', otp: '123456' };
            (userRepository.getOne as jest.Mock).mockResolvedValue({ is_disabled: true });

            await userController.VerifyEmail(req as ExpressRequest, res as Response);

            expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith({
                res,
                code: HTTP_CODES.FORBIDDEN,
                error: 'This account has been disabled',
            });
        });

        it('should return bad request if OTP verification fails', async () => {
            req.body = { email: 'test@example.com', otp: '123456' };
            (userRepository.getOne as jest.Mock).mockResolvedValue({ id: 'userId' });
            (otpRepository.verifyOtp as jest.Mock).mockResolvedValue({ status: false, message: 'Invalid OTP' });

            await userController.VerifyEmail(req as ExpressRequest, res as Response);

            expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith({
                res,
                code: HTTP_CODES.BAD_REQUEST,
                error: 'Invalid OTP',
            });
        });

        it('should verify email and return success response', async () => {
            req.body = { email: 'test@example.com', otp: '123456' };
            const user = { id: 'userId', username: 'johndoe', email: 'test@example.com' };
            (userRepository.getOne as jest.Mock).mockResolvedValue(user);
            (otpRepository.verifyOtp as jest.Mock).mockResolvedValue({ status: true });
            (UtilFunctions.generateToken as jest.Mock).mockResolvedValue('token');

            await userController.VerifyEmail(req as ExpressRequest, res as Response);

            expect(userRepository.atomicUpdate).toHaveBeenCalledWith(
                { id: user.id },
                {
                    first_login: true,
                    last_login: new Date(),
                    verified_email: true,
                    verified_email_at: new Date(),
                }
            );

            expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith({
                res,
                code: HTTP_CODES.CREATED,
                message: 'Your email verification is successful!',
                data: {
                    token: 'token',
                    ...user,
                },
            });
        });

        it('should handle internal server error', async () => {
            req.body = { email: 'test@example.com', otp: '123456' };
            (userRepository.getOne as jest.Mock).mockRejectedValue(new Error('Internal Server Error'));

            await userController.VerifyEmail(req as ExpressRequest, res as Response);

            expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith({
                res,
                code: HTTP_CODES.INTERNAL_SERVER_ERROR,
                error: 'Error: Internal Server Error',
            });
        });
    });

    // Similarly, you can write tests for other functions such as `resendVerification`, `LoginMobile`, `recover`, `verifyOtp`, `resetPassword`, and `getUserDetails`.

    // Example for resendVerification
    describe('ResendVerification', () => {
        beforeEach(() => {
          req = {
            body: {
              email: 'johndoe@example.com',
              password: 'password123',
            },
          };
        });

    describe('resendVerification', () => {
        it('should return not found if user does not exist', async () => {
            req.body = { email: 'test@example.com' };
            (userRepository.getOne as jest.Mock).mockResolvedValue(null);

            await userController.resendVerification(req as ExpressRequest, res as Response);

            expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith({
                res,
                code: HTTP_CODES.NOT_FOUND,
                error: 'This email address is not registered on Transactly.',
            });
        });

        it('should return conflict if email is already verified', async () => {
            req.body = { email: 'test@example.com' };
            (userRepository.getOne as jest.Mock).mockResolvedValue({ verified_email: true });

            await userController.resendVerification(req as ExpressRequest, res as Response);

            expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith({
                res,
                code: HTTP_CODES.CONFLICT,
                error: 'Your email address has already been verified',
            });
        });

        it('should return forbidden if account is disabled', async () => {
            req.body = { email: 'test@example.com' };
            (userRepository.getOne as jest.Mock).mockResolvedValue({ is_disabled: true });

            await userController.resendVerification(req as ExpressRequest, res as Response);

            expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith({
                res,
                code: HTTP_CODES.FORBIDDEN,
                error: 'This account has been disabled',
            });
        });

        it('should resend verification email and return success response', async () => {
            req.body = { email: 'test@example.com' };
            const user = { id: 'userId', username: 'johndoe', email: 'test@example.com' };
            (userRepository.getOne as jest.Mock).mockResolvedValue(user);
            (UtilFunctions.generateOtp as jest.Mock).mockResolvedValue({ otp: '123456' });

            await userController.resendVerification(req as ExpressRequest, res as Response);

            expect(UtilFunctions.sendEmail2).toHaveBeenCalledTimes(2);
            expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith({
                message: 'Verification email resent! Please check your inbox',
                code: HTTP_CODES.CREATED,
                res,
            });
        });

        it('should handle internal server error', async () => {
            req.body = { email: 'test@example.com' };
            (userRepository.getOne as jest.Mock).mockRejectedValue(new Error('Internal Server Error'));

            await userController.resendVerification(req as ExpressRequest, res as Response);

            expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith({
                res,
                code: HTTP_CODES.INTERNAL_SERVER_ERROR,
                error: 'Error: Internal Server Error',
            });
        });
    });

    describe('Recover', () => {
        beforeEach(() => {
          req = {
            body: {
              email: 'johndoe@example.com',
            },
          };
        });

    it('should return not found if email is not registered', async () => {
        jest.spyOn(userRepository, 'getOne').mockResolvedValueOnce(null);
        await userController.LoginMobile(req as ExpressRequest, res as Response);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          error: 'This email address is not registered on Transactly.',
        });
      });

      it('should return unauthorized if email is not verified', async () => {
        jest.spyOn(userRepository, 'getOne').mockResolvedValueOnce({ verified_email: false } as any);
        await userController.LoginMobile(req as ExpressRequest, res as Response);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          code: 200,
          message: 'Email is not verified yet',
          data: {
            verified_email: false,
          },
        });
      });

      it('should return forbidden if account is disabled', async () => {
        jest.spyOn(userRepository, 'getOne').mockResolvedValueOnce({ is_disabled: true } as any);
        await userController.LoginMobile(req as ExpressRequest, res as Response);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          error: 'Account blocked, Contact admin: hello@Transactly.co',
        });
      });

      it('should return bad request if password is incorrect', async () => {
        jest.spyOn(userRepository, 'getOne').mockResolvedValueOnce({ verified_email: true, is_disabled: false, password: 'wrongpassword' } as any);
        await userController.LoginMobile(req as ExpressRequest, res as Response);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          error: 'Invalid Password! Please input the correct one.',
        });
      });

      it('should return success if login is successful', async () => {
        const user = { id: '123', username: 'johndoe', email: 'johndoe@example.com', password: 'password123', first_login: true } as any;
        jest.spyOn(userRepository, 'getOne').mockResolvedValueOnce(user);
        jest.spyOn(UtilFunctions, 'generateToken').mockResolvedValueOnce('token');
        jest.spyOn(userRepository, 'atomicUpdate').mockResolvedValueOnce(null);

        await userController.LoginMobile(req as ExpressRequest, res as Response);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          success: true,
          message: `Welcome back ${user.username}!`,
          data: expect.objectContaining({ token: 'token' }),
        })
    });

    it('should return not found if email is not registered', async () => {
        jest.spyOn(userRepository, 'getOne').mockResolvedValueOnce(null);
        await userController.recover(req as ExpressRequest, res as Response);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          error: 'User with this email does not exist',
        });
      });

      it('should return success if recovery email is sent', async () => {
        jest.spyOn(userRepository, 'getOne').mockResolvedValueOnce({ id: '123', email: 'johndoe@example.com' } as any);
        // jest.spyOn(UtilFunctions, 'generateOtp').mockResolvedValueOnce({ otp: '123456' });
        // jest.spyOn(UtilFunctions, 'sendEmail').mockResolvedValueOnce(undefined);

        await userController.recover(req as ExpressRequest, res as Response);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          success: true,
          message: 'Recovery email sent! Please check your inbox',
        });
    });
    });

    describe('Verify OTP', () => {
        beforeEach(() => {
          req = {
            body: {
              email: 'johndoe@example.com',
              otp: '123456',
            },
          };
        });

    it('should return bad request if OTP verification fails', async () => {
        jest.spyOn(otpRepository, 'verifyOtp').mockResolvedValueOnce({ status: false, message: 'Invalid OTP' });

        await userController.verifyOtp(req as ExpressRequest, res as Response);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          error: 'Invalid OTP',
        });
      });

      it('should return success if OTP verification succeeds', async () => {
        jest.spyOn(otpRepository, 'verifyOtp').mockResolvedValueOnce({ status: true });

        await userController.verifyOtp(req as ExpressRequest, res as Response);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          success: true,
          message: 'OTP verification successful',
        });
      });
    });

      describe('resetPassword', () => {
        beforeEach(() => {
          req = {
            body: {
              email: 'johndoe@example.com',
              password: 'newpassword',
            },
          };
        });

      it('should return not found if email is not registered', async () => {
        jest.spyOn(userRepository, 'getOne').mockResolvedValueOnce(null);
        await userController.resetPassword(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          error: 'User with this email does not exist',
        });
      });

      it('should return success if password is reset', async () => {
        jest.spyOn(userRepository, 'getOne').mockResolvedValueOnce({ id: '123', email: 'johndoe@example.com' } as any);
        // jest.spyOn(UtilFunctions, 'hashPassword').mockResolvedValueOnce('hashedpassword');
        jest.spyOn(userRepository, 'atomicUpdate').mockResolvedValueOnce(null);

        await userController.resetPassword(req as ExpressRequest, res as Response);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          success: true,
          message: 'Password reset successful',
        });
      });
    });

    describe('Get User Details', () => {
        beforeEach(() => {
          req = {
            user: {
              id: '123',
            },
          };
        });

      it('should return user details', async () => {
        const user = { id: '123', username: 'johndoe', email: 'johndoe@example.com' } as any;
        jest.spyOn(userRepository, 'getOne').mockResolvedValueOnce(user);

        await userController.getUserDetails(req as ExpressRequest, res as Response);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          success: true,
          data: user,
        });
      });

      it('should handle errors', async () => {
        jest.spyOn(userRepository, 'getOne').mockRejectedValueOnce(new Error('Database error'));

        await userController.getUserDetails(req as ExpressRequest, res as Response);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          error: 'Database error',
        });
      });
    });
});

});
