import { Response } from 'express';
import { ExpressRequest } from '../../server';
import roleRepository from '../../repositories/transactionRef.repository';
import { throwIfAdminUserUndefined } from '../../util';
import ResponseHandler from '../../util/response-handler';
import { HTTP_CODES } from '../../constants/app_defaults.constant';
import permissionRepository from '../../repositories/permission.repository';

export async function createRole(req: ExpressRequest, res: Response) {
  try {
    throwIfAdminUserUndefined(req.admin_user, 'req.admin_user');
    const { role_name, role_description, permissions } = req.body;

    const role = await roleRepository.create({
      role_name,
      role_description,
      permissions,
    });

    return ResponseHandler.sendSuccessResponse({
      res,
      code: HTTP_CODES.OK,
      message: 'Success! The role has been created.',
      data: role,
    });
  } catch (err: Error | unknown | any) {
    return ResponseHandler.sendErrorResponse({
      res,
      code: HTTP_CODES.INTERNAL_SERVER_ERROR,
      error: `${err}`,
    });
  }
}

export async function getRole(req: ExpressRequest, res: Response) {
  try {
    throwIfAdminUserUndefined(req.admin_user, 'req.admin_user');
    const { role_id } = req.params;

    const role = await roleRepository.getOne({
      where: {role_id: role_id },
      select: { permissions: true }
    });

    return ResponseHandler.sendSuccessResponse({
      res,
      code: HTTP_CODES.OK,
      message: 'Your role details have been retrieved successfully!',
      data: role,
    });
  } catch (err: Error | unknown | any) {
    return ResponseHandler.sendErrorResponse({
      res,
      code: HTTP_CODES.INTERNAL_SERVER_ERROR,
      error: `${err}`,
    });
  }
}

export async function getRoles(req: ExpressRequest, res: Response) {
  try {
    throwIfAdminUserUndefined(req.admin_user, 'req.admin_user');

    const roles = await roleRepository.get({});

    return ResponseHandler.sendSuccessResponse({
      res,
      code: HTTP_CODES.OK,
      message: 'Your details have been retrieved successfully!',
      data: roles,
    });
  } catch (err: Error | unknown | any) {
    return ResponseHandler.sendErrorResponse({
      res,
      code: HTTP_CODES.INTERNAL_SERVER_ERROR,
      error: `${err}`,
    });
  }
}

export async function deleteRole(req: ExpressRequest, res: Response) {
  try {
    throwIfAdminUserUndefined(req.admin_user, 'req.admin_user');
    const { role_id } = req.params;

    const role = await roleRepository.delete({
      where: {id: role_id}
    });

    if (role) {

      return ResponseHandler.sendSuccessResponse({
        res,
        code: HTTP_CODES.OK,
        message: "And... it's gone! Role deleted successfully.",
      });
    }
  } catch (err: Error | unknown | any) {
    return ResponseHandler.sendErrorResponse({
      res,
      code: HTTP_CODES.INTERNAL_SERVER_ERROR,
      error: `${err}`,
    });
  }
}

export async function updateRole(req: ExpressRequest, res: Response) {
  try {
    throwIfAdminUserUndefined(req.admin_user, 'req.admin_user');
    const { role_id } = req.params;
    const { role_name, role_description } = req.body;

    const get_role = await roleRepository.getOne({
      where: {id: role_id}
    });

    if (!get_role) {
      return ResponseHandler.sendErrorResponse({
        res,
        code: HTTP_CODES.NOT_FOUND,
        error: 'Role not found',
      });
    }

    const role = await roleRepository.atomicUpdate(
      { id: role_id },
      {
        role_name: role_name ? role_name : get_role.role_name,
        role_description: role_description ? role_description : get_role.role_description,
      });

    return ResponseHandler.sendSuccessResponse({
      res,
      code: HTTP_CODES.OK,
      message: 'Nice work! Role successfully updated.',
    });
  } catch (err: Error | unknown | any) {
    return ResponseHandler.sendErrorResponse({
      res,
      code: HTTP_CODES.INTERNAL_SERVER_ERROR,
      error: `${err}`,
    });
  }
}

export async function addPermissions(req: ExpressRequest, res: Response) {
  try {
    const admin_user = throwIfAdminUserUndefined(req.admin_user, 'req.admin_user');
    const { role_id } = req.params;
    const { permissions } = req.body;

    const get_role = await roleRepository.getOne({
      where: { id: role_id}
    });

    if (!get_role) {
      return ResponseHandler.sendErrorResponse({
        res,
        code: HTTP_CODES.NOT_FOUND,
        error: "Oops! We couldn't find that role. Please try again",
      });
    }

    permissions.find((permission: any) => {
      if (!get_role?.permissions.includes(permission)) {
        return ResponseHandler.sendErrorResponse({
          res,
          code: HTTP_CODES.NOT_FOUND,
          error: 'Missing permission(s), please try again.',
        });
      }

      if (permission.hierarchy === 1 && get_role.hierarchy > 1) {
        return ResponseHandler.sendErrorResponse({
          res,
          code: HTTP_CODES.NOT_FOUND,
          error: `Access denied! You are not authorized to add the ${permission.permission_name} permission.`,
        });
      }
    });

    const role = await roleRepository.atomicUpdate(
      { id: role_id },
      {
        permissions: permissions ? permissions : get_role.permissions,
      },
    );

    return ResponseHandler.sendSuccessResponse({
      res,
      code: HTTP_CODES.OK,
      message: 'Well done! Permission added successfully.',
    });
  } catch (err: Error | unknown | any) {
    return ResponseHandler.sendErrorResponse({
      res,
      code: HTTP_CODES.INTERNAL_SERVER_ERROR,
      error: `${err}`,
    });
  }
}

export async function removePermissions(req: ExpressRequest, res: Response) {
  try {
    const admin_user = throwIfAdminUserUndefined(req.admin_user, 'req.admin_user');
    const { role_id } = req.params;
    const { permissions } = req.body;

    const get_role = await roleRepository.getOne({
      where: { id: role_id}
    });

    if (!get_role) {
      return ResponseHandler.sendErrorResponse({
        res,
        code: HTTP_CODES.NOT_FOUND,
        error: "Hmmm. This role doesn't seem to exist. Please check again.",
      });
    }

    permissions.find((permission: any) => {
      if (!get_role?.permissions.includes(permission)) {
        return ResponseHandler.sendErrorResponse({
          res,
          code: HTTP_CODES.NOT_FOUND,
          error: 'Oops! Looks like one or more permission was not found.',
        });
      }

      if (permission.hierarchy === 1 && get_role.hierarchy > 1) {
        return ResponseHandler.sendErrorResponse({
          res,
          code: HTTP_CODES.NOT_FOUND,
          error: `Access denied! You are not authorized to add the ${permission.permission_name} permission`,
        });
      }
    });

    const role = await roleRepository.atomicUpdate(
      { id: role_id },
      {
        permissions: permissions ? permissions : get_role.permissions,
      },
    );

    return ResponseHandler.sendSuccessResponse({
      res,
      code: HTTP_CODES.OK,
      message: 'Access rights successfully revoked.',
    });
  } catch (err: Error | unknown | any) {
    return ResponseHandler.sendErrorResponse({
      res,
      code: HTTP_CODES.INTERNAL_SERVER_ERROR,
      error: `${err}`,
    });
  }
}

export async function disableRole(req: ExpressRequest, res: Response) {
  try {
    const admin_user: any = throwIfAdminUserUndefined(req.admin_user, 'req.admin_user');
    const { role_id } = req.params;

    const get_role = await roleRepository.getOne({
      where: { id: role_id}
    });

    if (!get_role) {
      return ResponseHandler.sendErrorResponse({
        res,
        code: HTTP_CODES.NOT_FOUND,
        error: "Hmmm. This role doesn't seem to exist. Please check again.",
      });
    }

    if (get_role.hierarchy === 1 && admin_user.hierarchy > 1) {
      return ResponseHandler.sendErrorResponse({
        res,
        code: HTTP_CODES.UNAUTHORIZED,
        error: 'You do not have the necessary clearance to disable this role.',
      });
    }

    const role = await roleRepository.atomicUpdate(
      { id: role_id },
      {
        status: false,
      },
    );

    return ResponseHandler.sendSuccessResponse({
      res,
      code: HTTP_CODES.OK,
      message: "Done! That role won't be causing any trouble now.",
    });
  } catch (err: Error | unknown | any) {
    return ResponseHandler.sendErrorResponse({
      res,
      code: HTTP_CODES.INTERNAL_SERVER_ERROR,
      error: `${err}`,
    });
  }
}

export async function enableRole(req: ExpressRequest, res: Response) {
  try {
    const admin_user = throwIfAdminUserUndefined(req.admin_user, 'req.admin_user');
    const { role_id } = req.params;

    const get_role = await roleRepository.getOne({
      where: { id: role_id}
    });

    if (!get_role) {
      return ResponseHandler.sendErrorResponse({
        res,
        code: HTTP_CODES.NOT_FOUND,
        error: "Hmmm. This role doesn't seem to exist. Please check again.",
      });
    }

    // if (get_role.hierarchy === 1 && admin_user.hierarchy > 1) {
    //   return ResponseHandler.sendErrorResponse({
    //     res,
    //     code:HTTP_CODES.UNAUTHORIZED,
    //     error: 'You are not allowed to enable this role, its authority is beyond your reach',
    //   });
    // }

    const role = await roleRepository.atomicUpdate(
      { id: role_id },
      {
        status: true,
      },
    );

    return ResponseHandler.sendSuccessResponse({
      res,
      code: HTTP_CODES.OK,
      message: "You're all set!",
    });
  } catch (err: Error | unknown | any) {
    return ResponseHandler.sendErrorResponse({
      res,
      code: HTTP_CODES.INTERNAL_SERVER_ERROR,
      error: `${err}`,
    });
  }
}

export async function getPermissions(req: ExpressRequest, res: Response) {
  // try block to attempt retrieving permissions from the permissionRepository
  try {
    const permissions = await permissionRepository.get({});

    // Return success response with retrieved permissions
    return ResponseHandler.sendSuccessResponse({
      res,
      code: HTTP_CODES.OK,
      message: 'Your details have been retrieved successfully!',
      data: permissions,
    });
  } catch (err: Error | unknown | any) {
    // Return error response if trying to retrieve permissions fails
    return ResponseHandler.sendErrorResponse({
      res,
      code: HTTP_CODES.INTERNAL_SERVER_ERROR,
      error: `${err}`,
    });
  }
}
