import { HTTP_CODES } from "../../constants/app_defaults.constant";
import tagRepository from "../../repositories/tag.repository";
import { ExpressRequest } from "../../server";
import ResponseHandler from "../../util/response-handler";
import { Response } from "express";

/***
 *
 * Create Tags
 *
 */
export async function createTag(
    req: ExpressRequest,
    res: Response,
): Promise<Response | void> {
    const {
        name,
    }: {
        name: string;
    } = req.body;

    try{

        const tag = await tagRepository.create({name});

        // return success response after successful user creation
        return ResponseHandler.sendSuccessResponse({
            message: `Tag created successfully`,
            code: HTTP_CODES.CREATED,
            res,
            data: tag
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
 * Get Tags
 *
 */
export async function getTags(
    req: ExpressRequest,
    res: Response,
): Promise<Response | void> {
    try{
        const tag = await tagRepository.get({ });

        // return success response after successful user creation
        return ResponseHandler.sendSuccessResponse({
            message: `Tag fetched successfully`,
            code: HTTP_CODES.CREATED,
            res,
            data: tag
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
 * Edit Tags
 *
 */
export async function editTag(
    req: ExpressRequest,
    res: Response,
): Promise<Response | void> {
    const {
        name,
    }: {
        name: string;
    } = req.body;

    try{

        const tag = await tagRepository.atomicUpdate(
            { id: String(req.params.tag_id) },
            {
                name: name,
            }
        );

        // return success response after successful user creation
        return ResponseHandler.sendSuccessResponse({
            message: `Tag edited successfully`,
            code: HTTP_CODES.CREATED,
            res,
            data: tag
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
 * Delete Tags
 *
 */
export async function deleteTag(
    req: ExpressRequest,
    res: Response,
): Promise<Response | void> {
    try{
        const tag = await tagRepository.delete(
            { id : req.params.tag_id }
        );

        // return success response after successful user creation
        return ResponseHandler.sendSuccessResponse({
            message: `Tag deleted successfully`,
            code: HTTP_CODES.CREATED,
            res,
            data: tag
        });

    } catch(error) {
        return ResponseHandler.sendErrorResponse({
            res,
            code: HTTP_CODES.INTERNAL_SERVER_ERROR,
            error: `${error}`,
        });
    }
}