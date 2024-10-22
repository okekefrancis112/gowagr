//Importing various modules
import path from "path";
import crypto from "crypto";
import fs from "fs";
import * as handlebars from "handlebars";
import moment from "moment";
import { UploadedFile } from "express-fileupload";
import jwt from "jsonwebtoken";
import { ExpressRequest, ExpressResponse } from "../server";
import { Namespaces } from "../constants/namespace.constant";

//Importing configuration variables
import {
    TOKEN_EXPIRE_TIME,
    SERVER_TOKEN_ISSUER,
    SERVER_TOKEN_SECRET,
} from "../config/env.config";
//Utlities
import Logger from "../util/logger";
import { env } from "../config/env.config";
import { IUser } from "../interfaces/user.interface";
import ResponseHandler from "./response-handler";
import otpRepository from "../repositories/otp.repository";
import userRepository from "../repositories/user.repository";
import { HTTP_CODES, urls } from "../constants/app_defaults.constant";
import walletRepository from "../repositories/wallet.repository";
const nodemailer = require("nodemailer");

const logger = new Logger("general", Namespaces.FUNCTIONS);

export const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month - 1, 1);
};

export const getNumberOfDaysInMonth = () => {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};

export const checkIfEmpty = (value: any) => {
    if (value === null || value === undefined) {
        return true;
    }

    if (typeof value === "object") {
        return Object.keys(value).length === 0;
    }

    if (Array.isArray(value) && value.length === 0) {
        return true;
    }

    return typeof value === "string" && value.trim().length === 0;
};

export const switchDate = (value: string) => {
    const [day, month, year] = value.split("-");
    return `${year}-${month}-${day}`;
};

class UtilFunctions {
    // =====================================================================================================

    public static generateRef({ length }: { length: number }) {
        let characters =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let result = "";

        for (let i = 0; i < length; i++) {
            result += characters[Math.floor(Math.random() * characters.length)];
        }
        return result;
    }

    // =====================================================================================================

    // This function is used to generate a referral code with upper case characters
    public static generateReferralCode() {
        return UtilFunctions.generateRef({ length: 6 }).toUpperCase();
    }

    // =====================================================================================================

    // Function to generate a wallet account number
    // Generates a random account number for the wallet
    public static async generateWalletAccountNumber(): Promise<any> {
        // Generate a random 7-digit number
        const result = `321${Math.floor(Math.random() * 9000000) + 1000000}`;

        // Check if the generated account number already exists in the database
        const checkWallets = await walletRepository.get({
            walletAccountNumber: result,
        });

        // If the account number exists, generate a new one and return it, else return the current one
        return checkWallets ? await UtilFunctions.generateWalletAccountNumber() : result;
    }

    // =====================================================================================================

    // This function is used to generate a Transaction Reference with upper case characters
    public static generateTXRef() {
        const key = `Transactly_TX_REF${this.generateRef({
            length: 12,
        })}`.toUpperCase();
        return key;
    }

    // =====================================================================================================

    // This function is used to generate a Transaction Hash with upper case characters
    public static generateTXHash() {
        return `Transactly_TX_HASH_REF${this.generateRef({
            length: 22,
        })}`.toUpperCase();
    }

    // =====================================================================================================

    // This function is used to check if a given value is empty or not
    public static isEmpty(value: any): boolean {
        if (value === null || value === undefined) {
            return true;
        }

        if (typeof value === "object") {
            return Object.keys(value).length === 0;
        }

        return typeof value === "string" && value.trim().length === 0;
    }

    // =====================================================================================================
    // This function is used to generate a random string of hexadecimal characters
    // with a default length of 16.
    public static generateRandomString = (length = 16) => {
        // Generates a set of random bytes with the specified length
        const randomBytes = crypto.randomBytes(length);
        // Convert the random bytes to a hexadecimal string and return it
        return randomBytes.toString("hex");
    };

    // =====================================================================================================

    // Generates an OTP for a given userId
    public static async generateOtp({
        userId,
        token,
        mins = 15,
    }: {
        userId: string;
        token?: string;
        mins?: number;
    }) {
        const ttl = mins * 60 * 1000;
        // const otp = env.isDev ? 1234 : Math.floor(Math.random() * 8999 + 1000);
        const otp = Math.floor(Math.random() * 89999 + 10000);

        // Set the expiration date of the OTP
        const expires_in = new Date(Date.now() + ttl);
        const check_otp = await otpRepository.getOne({ userId });
        if (!check_otp) {
            // Create a new OTP record in the database
            return otpRepository.create({
                userId: userId,
                otp: otp,
                token: token,
                expires_in: expires_in,
            });
        } else {
            // Update the existing OTP record in the database
            return otpRepository.atomicUpdate(
                { userId: userId },
                {
                    otp,
                    token,
                    expires_in,
                }
            );
        }
    }

    // =====================================================================================================

    // Generate a 4-digit random OTP for admin
    public static async generateAdminOtp({
        admin_id,
    }: {
        admin_id: string;
    }) {
        // Generate a 4-digit random number between 1000 and 9999
        const otp = Math.floor(Math.random() * 9000 + 1000);
        // Set time to live of the OTP to 15 minutes in milliseconds
        const ttl = 15 * 60 * 1000;
        // Calculate expiry timestamp of the OTP
        const expires_in = new Date(Date.now() + ttl);

        // Check if an OTP exists for the admin
        let check_otp = await otpRepository.getOne({ admin_id: admin_id });
        // If an OTP exists, update it with the new one
        if (check_otp) {
            return otpRepository.atomicUpdate(
                { admin_id: admin_id },
                {
                    otp,
                    expires_in,
                }
            );
        }
        // Otherwise, create a new OTP for the admin
        return otpRepository.create({
            admin_id,
            otp,
            expires_in,
        });
    }

    // =====================================================================================================

    public static async sendEmail2(
        template: any,
        { to = "", subject = "", props = {}, attachment = "" }
    ) {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'okeke98@gmail.com',
              pass: 'jouydoogfqftyvjd'
            }
          });

        // Read the Handlebars template file
        const templateSource = fs.readFileSync(
            path.join(__dirname, `../views/emails/${template}`),
            "utf8"
        );

        // Compile the template
        const template_file = handlebars.compile(templateSource);
        const cb = (err: any, info: any) => {
            // Callback function when sending mail is complete
            if (err) {
                logger.error("🤕 NodeMailer test failed with error:\n", err);
                return false;
            }
            logger.info("📬 Successfully sent NodeMailer test with result:\n", info.messageId);
            return true;
        };

        // Send the email
        transporter.sendMail(
            {
                from: `Ideas Impact <no-reply@ideasimpact.co>`,
                to,
                subject: subject,
                attachment: attachment,
                html: template_file(props as any),
                ...props,
            },
            cb
        );
    }

    // =====================================================================================================
    /** Generate and sign a user Token */
    public static async generateToken(
        data: any,
        timeToLive: any = `${TOKEN_EXPIRE_TIME}`,
        secret: any = `${SERVER_TOKEN_SECRET}`
    ) {
        return new Promise((resolve, _reject) => {
            const signOptions: any = {
                issuer: `${SERVER_TOKEN_ISSUER}`,
                subject: "Transactly. [Author: Okeke Francis.]",
                algorithm: "HS256",
                audience: ["Nigerians & Diaspora"],
            };
            signOptions.expiresIn = timeToLive;

            jwt.sign(data, secret, signOptions, (err: any, token: any) => {
                if (err) {
                    logger.error(err.message);
                }

                resolve(token);
            });
        });
    }

    // =====================================================================================================
    /** Generate and sign a user Token */
    public static async generatePrivateKeyToken(
        data: any,
        // timeToLive: any = `${TOKEN_EXPIRE_TIME}`,
        secret: any = `${SERVER_TOKEN_SECRET}`
    ) {
        return new Promise((resolve, _reject) => {
            const signOptions: any = {
                issuer: `${SERVER_TOKEN_ISSUER}`,
                subject: "Transactly. [Author: Okeke Francis.]",
                algorithm: "HS256",
                audience: ["Nigerians & Diaspora"],
            };
            // signOptions.expiresIn = timeToLive;

            jwt.sign(data, secret, signOptions, (err: any, token: any) => {
                if (err) {
                    logger.error(err.message);
                }
                resolve(token);
            });
        });
    }

    // =====================================================================================================
    /** Generate and sign a user Token */
    public static async verifyToken(token: any) {
        try {
            const decoded = jwt.verify(token, `${SERVER_TOKEN_SECRET}`);
            console.log("decoded: ", decoded);
            return { status: true, decoded };
        } catch (err) {
            console.log("err: ", err);
            return { status: false, error: err };
        }
    }

    // =====================================================================================================
    /**************
     *
     *
     * Get Today Time
     */

    public static async getTodayTime() {
        const start = new Date();
        start.setHours(0, 0, 0, 0);

        const end = new Date();
        end.setHours(23, 59, 59, 999);

        return { start, end };
    }

    // =====================================================================================================
    /**************
     *
     *
     * Subtract Days
     */

    public static async subtractDays(days: number) {
        return new Date(new Date().setDate(new Date().getDate() - days));
    }

    // =====================================================================================================

    /******
     *
     *
     *
     * Validate Image Upload
     */

    public static async validateUploadedFile({
        file: theFile,
        maxSize = 2000000, // 2 Mega bytes
        allowedMimeTypes = ["image/jpeg", "image/png", "image/jpg"],
    }: {
        file: UploadedFile | UploadedFile[];
        maxSize?: number;
        allowedMimeTypes?: string[];
    }): Promise<any> {
        const file = theFile as UploadedFile;
        if (file.size > maxSize) {
            return {
                error: "File upload error. Please ensure the file size is not more than 2MB.",
                success: false,
            };
        }

        const fileType = file.mimetype;
        if (!allowedMimeTypes.includes(fileType)) {
            return {
                error: `Invalid file type selected. Please select an image/jpeg file.`,
                success: false,
            };
        }

        return {
            data: file,
            success: true,
        };
    }
}

export default UtilFunctions;

// =====================================================================================================

export function throwIfUndefined<T>(x: T | undefined, name?: string): T {
    if (x === undefined) {
        throw new Error(`${name} must not be undefined`);
    }
    return x;
}

// =====================================================================================================

export function throwIfAdminUserUndefined<T>(
    x: T | undefined,
    name?: string
): T {
    if (x === undefined) {
        throw new Error(`This is an admin user. ${name} must not be undefined`);
    }

    return x;
}

// =====================================================================================================

export const generateTXRef = () => {
    const prefix = "Transactly_TX_REF";
    const key = prefix + UtilFunctions.generateRef("12");
    return key.toUpperCase();
};

// =====================================================================================================

export const generateTXHash = () => {
    const prefix = "Transactly_TX_HASH_REF";
    const key = prefix + UtilFunctions.generateRef("12");
    return key.toUpperCase();
};

// =====================================================================================================

export const slugify = (text: string) => {
    const text_new = text
        .toLowerCase()
        .replace(/ /g, "-")
        .replace(/[^\w-]+/g, "");
    return text_new;
};

// =====================================================================================================

export const countUniqueItems = (e: any) => {
    return new Set(e).size;
};

// =====================================================================================================

export const getUniqueItems = (e: any) => {
    return new Set(e);
};

// =====================================================================================================

export const convertDate = (date: any) => {
    return new Date(date).toISOString();
};

// =====================================================================================================

export const getPercent = (number: number) => {
    return number / 100;
};

// =====================================================================================================

export const formatDecimal = (number: number, places: number) => {
    const result = Math.floor(Number(number) * places) / places;
    return result;
};

// =====================================================================================================

export const getMonthsDate = (startDate: any, stopDate: any) => {
    const dateStart = moment(startDate);
    const dateEnd = moment(stopDate);
    const interim = dateStart.clone();
    const timeValues = [];

    while (dateEnd > interim || interim.format("M") === dateEnd.format("M")) {
        timeValues.push(interim.format("YYYY-MM"));
        interim.add(1, "month");
    }
    return timeValues;
};

// =====================================================================================================

export const getDaysDate = (startDate: any, stopDate: any) => {
    const dateArray = [];
    let currentDate = moment(startDate);
    stopDate = moment(stopDate);
    while (currentDate <= stopDate) {
        dateArray.push(moment(currentDate).format("YYYY-MM-DD"));
        currentDate = moment(currentDate).add(1, "days");
    }
    return dateArray;
};

export const generateInvitation = () => {
    const invitation_token = crypto.randomBytes(20).toString("hex");
    const invitation_expires = Date.now() + 3600000;

    return { invitation_token, invitation_expires };
};

// =====================================================================================================

export const areDatesInSameMonthAndYear = (
    date1: Date,
    date2: Date
): boolean => {
    return (
        date1.getMonth() === date2.getMonth() &&
        date1.getFullYear() === date2.getFullYear()
    );
};

// =====================================================================================================

// // This function gets an authorized user from the request parameter
// export async function getAuthorizedUser(req: ExpressRequest): Promise<any> {
//     // Throw error if user is undefined
//     const auth = throwIfUndefined(req.user, "req.user");
//     // Get user by id
//     const user = await userRepository.getById({ _id: auth._id });
//     // Check if user provided exists in the system
//     if (!user) {
//         return {
//             success: false,
//             message: "User not found",
//         };
//     }

//     // Return the user
//     return userRepository.getById({ _id: auth._id });
// }

// =====================================================================================================

export function IsoDate(date: Date) {
    return new Date(
        date.getTime() - date.getTimezoneOffset() * 60000
    ).toISOString();
}

// =====================================================================================================

export function link() {
    let prod_env: any = env.isProd;
    let url: any = {};
    if (!prod_env) {
        url = urls.dev_user;
    } else {
        url = urls.prod_user;
    }
    return url;
}

// =====================================================================================================

export function format_query_decimal(variable: any, decimal_place: number) {
    return {
        $toDouble: {
            $divide: [
                { $trunc: { $multiply: [variable, decimal_place] } },
                decimal_place,
            ],
        },
    };
}

// =====================================================================================================

export const repoPagination = ({
    page,
    perpage,
    total,
}: {
    page: number;
    perpage: number;
    total: number;
}) => {
    return {
        hasPrevious: page > 1,
        prevPage: page - 1,
        hasNext: page < Math.ceil(total / perpage),
        next: page + 1,
        currentPage: Number(page),
        total: total,
        pageSize: perpage,
        lastPage: Math.ceil(total / perpage),
    };
};

// =====================================================================================================

export const repoSearch = ({
    search,
    searchArray,
}: {
    search: string;
    searchArray: Array<string>;
}) => {
    let searchQuery: any = {};

    // Check if the search string is valid
    if (search && search !== "undefined" && search.trim().length > 0) {
        searchQuery.OR = searchArray.map((item: string) => {
            return {
                [item]: {
                    contains: search,
                    mode: 'insensitive', // Case-insensitive search
                },
            };
        });
    }

    return searchQuery;
};

