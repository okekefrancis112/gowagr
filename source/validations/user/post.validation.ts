import { NextFunction, Response } from 'express';
import Joi from 'joi';
import { ExpressRequest } from '../../server';
import ResponseHandler from '../../util/response-handler';
import { HTTP_CODES } from '../../constants/app_defaults.constant';


export async function validateCreatePost(
  req: ExpressRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> {
  const schema = Joi.object().keys({
    title: Joi.string().required(),
    location: Joi.string().required(),
  }).unknown();

  const validation = schema.validate(req.body);

  if (validation.error) {
    const error = validation.error.message
      ? validation.error.message
      : validation.error.details[0]?.message;

    return ResponseHandler.sendErrorResponse({ res, code: HTTP_CODES.BAD_REQUEST, error });
  }

  return next();
}

// export function validateTagId(
//   req: ExpressRequest,
//   res: Response,
//   next: NextFunction
// ) {
//   if (!req.params.tag_id || req.params.tag_id === "") {
//       return ResponseHandler.sendErrorResponse({
//           res,
//           code: HTTP_CODES.NOT_FOUND,
//           error: "Tag ID is required",
//       });
//   }
//   if (!prisma.Types.ObjectId.isValid(req.params.tag_id)) {
//       return ResponseHandler.sendErrorResponse({
//           res,
//           code: HTTP_CODES.NOT_FOUND,
//           error: "Invalid Project ID",
//       });
//   }

//   next();
// }
