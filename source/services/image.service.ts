import { UploadedFile } from "express-fileupload";
import AwsS3Integration from "../integrations/aws.integration";
import { IUserDocument } from "../interfaces/user.interface";
import userRepository from "../repositories/user.repository";
import { S3_BUCKET_NAME } from "../config";
import UtilFunctions from "../util";

class ImageService {
    public static async linkImageToUserProfile(
        profile_photo: UploadedFile,
        userId: string
    ): Promise<IUserDocument | null> {
        const awsResponse = await AwsS3Integration.uploadToBucket({
            Body: profile_photo.data,
            Bucket: `${S3_BUCKET_NAME}`,
            ContentType: profile_photo.mimetype,
            Key: `user-profile-image-${UtilFunctions.generateRandomString(5)}`,
        });

        const { Location: linkToFile } = awsResponse;

        let user = await userRepository.getOne({
            _id: userId,
            leanVersion: false,
        });

        if (user) {
            user = await userRepository.atomicUpdate(
                { _id: userId },
                { profile_photo: linkToFile }
            );
        }
        return user;
    }

    public static async uploadImageToS3(
        name: string,
        image: any,
        mimetype: string
    ) {
        const awsResponse = await AwsS3Integration.uploadToBucket({
            // ACL: "public-read",
            Body: image.data,
            Bucket: `${S3_BUCKET_NAME}`,
            ContentType: mimetype,
            Key: name,
        });
        const { Location: link } = awsResponse;
        return link;
    }

    public static async deleteImageFromS3(url: string) {
        const contents: string[] = url.split("/");
        const size: number = contents.length;

        const Key: any = contents[size - 1];

        const response = await AwsS3Integration.deleteFromBucket({
            Bucket: `${S3_BUCKET_NAME}`,
            Key,
        });

        return response;
    }
}

export default ImageService;
