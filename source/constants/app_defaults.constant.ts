import { env } from "../config/env.config";

export const APP_CONSTANTS = {
    GENERAL: {
        SALT_ROUNDS: 10,
        LIKELINESS_THRESHOLD: 0.67,
    },
    REDIRECTS: {
        WALLET: env.isDev
            ? "https://staging.Transactly.co/wallet"
            : "https://Transactly.co/wallet",
        ACCOUNT: env.isDev
            ? "https://staging.Transactly.co/account"
            : "https://Transactly.co/account",
        INVESTMENT: env.isDev
            ? "https://staging.Transactly.co/invest"
            : "https://Transactly.co/invest",
    },

    EXPORTS: {
        CSV: "csv",
        PDF: "pdf",
    },

    LIMITS: {
        MAXIMUM_WALLET_CREDIT_INCOMPLETE_KYC: 100,
        MAXIMUM_INVESTMENT_INCOMPLETE_KYC: 100,
    },

    OTP: {
        TTL_DEFAULT: 15,
        TTL_SECURITY: 5,
    },

    TOKEN_TYPE: {
        WITHDRAWAL: "withdrawal",
        TRANSFER: "transfer",
    },
};

export const HTTP_CODES = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500,
};

export const usd_rate = {
    real: 15,
    stock: 11,
    saving: 5,
};

export const ngn_rate = {
    real: 30,
    stock: 20,
    saving: 12,
};

export const urls = {
    dev_user: "https://staging.Transactly.co",
    prod_user: "https://Transactly.co",
};

export const ADMIN_INVITATION = "https://admin.Transactly.co";
