import { NextFunction, Response } from 'express';
import Joi from 'joi';
import { ExpressRequest } from '../../server';
import ResponseHandler from '../../util/response-handler';
import { HTTP_CODES } from '../../constants/app_defaults.constant';
// import { validate } from 'uuid';


export async function validateCreateRole(
  req: ExpressRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> {
  const schema = Joi.object()
    .keys({
      role_name: Joi.string().required(),
      role_description: Joi.string().required(),
    })
    .unknown();

  const validation = schema.validate(req.body);

  if (validation.error) {
    const error = validation.error.message
      ? validation.error.message
      : validation.error.details[0]?.message;

    return ResponseHandler.sendErrorResponse({ res, code: HTTP_CODES.BAD_REQUEST, error });
  }

  return next();
}

// export async function validateRoleId(req: ExpressRequest, res: Response, next: NextFunction) {
//     if (!validate(String(req.params.role_id))) {
//         return ResponseHandler.sendErrorResponse({
//             res,
//             code: HTTP_CODES.NOT_FOUND,
//             error: 'Invalid Role ID',
//         });
//       }

//   next();
// }
