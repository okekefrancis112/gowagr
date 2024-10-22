// import { Document, Types } from "prisma";

export enum IGenderType {
    MALE = "Male",
    FEMALE = "Female",
    OTHER = "Others",
}

export enum IRoleType {
    COACH = "coach",
    MEMBER = "member",
}



// Define the shape of user data
export interface IUser {
    id: string;
    fullname: string;
    username: string;
    // phone_number?: string;
    email: string;
    dob?: Date;
    country?: string;
    password?: string;
    location?: string;
    // isoCode?: string;
    gender?: string;
    // city?: string;
    image?: string;
    bio?: string;
    role?: IRoleType;
    tag?: string[];
    // password_set_at?: Date;
    // is_diaspora?: boolean;
    is_deleted?: boolean;
    is_deleted_at?: Date;
    // toggle_user_pin?: boolean;
    // devices: string[];
    // pin?: string;
    // pin_set_at?: Date;
    // is_pin_set?: boolean;
    first_login?: Date;
    last_login?: Date;
    login_count?: number;
    is_disabled?: boolean;
    // is_black_listed?: boolean;
    // can_refer?: boolean;
    // blacklist_category?: string;
    // blacklist_reason?: string;
    reset_password_token?: string;
    reset_password_expires?: Date;
    verified_email?: boolean;
    verified_email_at?: Date;
    // profile_photo?: string;
    // user_ref_code?: string;
    // referred_by?: Types.ObjectId;
    // referral_count?: number;
    // is_two_fa?: boolean;
    // two_fa_set_at?: Date;
    accepted_terms_conditions?: boolean;
    // notification_count?: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IUserDocument extends IUser {}
