import { Response } from 'express';
import { ExpressRequest } from '../../server';
import { UploadedFile } from 'express-fileupload';
import bcryptjs from 'bcryptjs';
import UtilFunctions, { throwIfAdminUserUndefined, slugify } from '../../util';
import ResponseHandler from '../../util/response-handler';
import adminUserRepository from '../../repositories/adminUser.repository';
import roleRepository from '../../repositories/role.repository';
import { HTTP_CODES } from '../../constants/app_defaults.constant';

/***
 *
 *
 * Get Admin Profile
 */
export async function getAdminProfile(
  req: ExpressRequest,
  res: Response
): Promise<Response | void> {
  try {
    const admin_user = throwIfAdminUserUndefined(req.admin_user, 'req.admin_user');
    const getAdmin = await adminUserRepository.getOne({
      where: { id: admin_user.id },
    });

    if (!getAdmin) {
      return ResponseHandler.sendErrorResponse({
        res,
        code: HTTP_CODES.NOT_FOUND,
        error: 'User not found. Please check your input.',
      });
    }

    const profile = await adminUserRepository.getOne({
      where: { id: admin_user.id },
      select: {
          first_name: true,
          last_name: true,
          email: true,
          phone_number: true,
          profile_photo: true,
          role: true,
      }
    }
    );

    const role = await roleRepository.getOne({
      where: {role_id: profile?.role},
      select: {
        permissions: true
      }
    });

    let totalPermissions: any = [];

    role?.permissions.forEach((e: any) => {
      totalPermissions.push(e.permission_description);
    });

    return ResponseHandler.sendSuccessResponse({
      res,
      code: HTTP_CODES.OK,
      message: 'Admin profile information fetched successfully.',
      data: {
        fullname: `${profile?.first_name} ${profile?.last_name}`,
        email: profile?.email,
        number: profile?.phone_number,
        image: profile?.profile_photo,
        role_name: role?.role_name,
        roleDescription: role?.role_description,
        permissions: totalPermissions,
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

/****
 *
 *
 * Upload Profile Image
 */

// export async function uploadProfileImage(
//   req: ExpressRequest,
//   res: Response
// ): Promise<Response | void> {
//   try {
//     const admin_user = throwIfAdminUserUndefined(req.admin_user, 'req.admin_user');
//     const admin = await adminUserRepository.getOne({ admin_id: admin_user._id });
//     const admin_profile_image = admin?.profile_photo!;

//     if (req.files?.profile_photo) {

//       if (admin_profile_image) {
//         await ImageService.deleteImageFromS3(admin_profile_image);
//       }

//       const profile_photo = req.files.profile_photo as UploadedFile;

//       const validateFileResult = await UtilFunctions.validateUploadedFile({
//         file: profile_photo,
//       });

//       if (!validateFileResult.success) {
//         return ResponseHandler.sendErrorResponse({
//           code: HTTP_CODES.BAD_REQUEST,
//           error: validateFileResult.error as string,
//           res,
//         });
//       }

//       await ImageService.linkImageToAdminProfile(profile_photo, admin_user._id);

//       return ResponseHandler.sendSuccessResponse({
//         res,
//         code: HTTP_CODES.CREATED,
//         message: 'Your new admin profile picture has been uploaded. Looking good!.',
//       });
//     }
//   } catch (error) {
//     return ResponseHandler.sendErrorResponse({
//       res,
//       code: HTTP_CODES.INTERNAL_SERVER_ERROR,
//       error: `${error}`,
//     });
//   }
// }

/**
 *
 *
 * Edit Admin Profile
 */

export async function editProfile(req: ExpressRequest, res: Response): Promise<Response | void> {
  try {
    const admin_user = throwIfAdminUserUndefined(req.admin_user, 'req.admin_user');

    Object.keys(req.body).forEach((e: string) => {
      if (req.body[e] === '' || req.body[e] === 'null' || req.body[e] === 'undefined' || req.body[e] === 'Invalid Date' || req.body[e] === 'invalid') {
        delete req.body[e];
      }
    });

    const edAdmin = await adminUserRepository.atomicUpdate(
      { id: admin_user.id},
      req.body
    );

    return ResponseHandler.sendSuccessResponse({
      res,
      code: HTTP_CODES.OK,
      message: 'Your changes have been saved successfully.',
      data: edAdmin,
    });
  } catch (error) {
    return ResponseHandler.sendErrorResponse({
      res,
      code: HTTP_CODES.INTERNAL_SERVER_ERROR,
      error: `${error}`,
    });
  }
}

/**
 *
 *
 * Reset Password
 */

export async function resetPassword(req: ExpressRequest, res: Response): Promise<Response | void> {
  try {
    const admin_user = throwIfAdminUserUndefined(req.admin_user, 'req.admin_user');
    const { current_password, new_password, confirm_password } = req.body;
    const admin = await adminUserRepository.getOne({
      where: { id: admin_user.id}
    });

    if (!admin) {
      return ResponseHandler.sendErrorResponse({
        res,
        code: HTTP_CODES.NOT_FOUND,
        error: `The details provided do not match any existing admin in our system.`,
      });
    }

    const result = bcryptjs.compareSync(current_password, admin?.password!);

    if (!result) {
      return ResponseHandler.sendErrorResponse({
        res,
        code: HTTP_CODES.NOT_FOUND,
        error: 'Password incorrect. Please try again.',
      });
    }

    if (new_password !== confirm_password) {
      return ResponseHandler.sendErrorResponse({
        res,
        code: HTTP_CODES.BAD_REQUEST,
        error: `The passwords provided do not match. Please check and try again.`,
      });
    }

    const password = bcryptjs.hashSync(new_password, 10);
    const saved = await adminUserRepository.atomicUpdate(
      { id: admin.id },
      { password: password },
    );

    return ResponseHandler.sendSuccessResponse({
      res,
      code: HTTP_CODES.OK,
      message: 'You have successfully updated your password.',
    });

  } catch (error) {
    return ResponseHandler.sendErrorResponse({
      res,
      code: HTTP_CODES.INTERNAL_SERVER_ERROR,
      error: `${error}`,
    });
  }
}
