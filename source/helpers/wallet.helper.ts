import { Types } from "aws-sdk/clients/acm";
import { IAction } from "../interfaces/webhook.interface";
import transactionRepository from "../repositories/transaction.repository";
import userRepository from "../repositories/user.repository";
import walletRepository from "../repositories/wallet.repository";
import transactionRefRepository from "../repositories/transactionRef.repository";
import { ICurrency, ITransactionStatus, ITransactionType } from "../interfaces/transaction.interface";

interface IWalletCredit {
    userId: string;
    amount: number;
    currency: ICurrency;
    userCurrency?: string;
    senderId?: string;
    receiverId?: string;
    paymentId?: string;
    note?: string;
    transactionHash?: string;
    isPaid?: boolean;
    reference?: string;
    isActive?: boolean;
    user?: string;
    description: string;
}

// Credit Wallet
export const creditWallet = async ({ data }: { data: IWalletCredit; session: any }) => {
    try {
        const {
            userId,
            amount,
            currency,
            transactionHash,
            reference,
            // senderId,
            // receiverId,
            // paymentId,
            // isPaid,
            note,
            description,
        } = data;

        // Check if Wallet exist
        const wallet = await walletRepository.getOne({
            where: { id: userId}
        });
        if (!wallet) {
            return {
                success: false,
                message: `Wallet does not exist`,
            };
        }

        let updateBalance;

        updateBalance = await walletRepository.processWalletCreditUpdates({
            userId,
            amount: Number(amount),
            balance: wallet?.balance,
        });

        // Save Transaction Ref
        const transactionRef = await transactionRefRepository.create({
            transactionHash,
            userId,
            amount,
        });

        // Save Transaction
        const transaction = await transactionRepository.create({
            amount,
            transactionHash,
            userId,
            transactionRefId: transactionRef.id,
            paymentReference: reference,
            transactionType: ITransactionType.CREDIT,
            description,
            note,
            currency,
            transactionStatus: ITransactionStatus.SUCCESSFUL,
        });

        const updateUser = await userRepository.atomicUpdate(
            { id: userId },
            { totalAmountFunded: amount },
        );

        return {
            success: true,
            message: `Wallet credited successfully`,
            data: {
                updateBalance,
                transactionRef,
                transaction,
                updateUser,
            },
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.message,
        };
    }
};

interface IWalletDebit {
    userId: string;
    amount: number;
    source_amount?: number;
    destination_amount?: number;
    transactionHash: string;
    reference: string;
    data?: any;
    description?: string;
    currency: ICurrency;
    exchange_rate_value?: number;
    exchange_rate_currency?: string;
    ip_address?: string;
    note?: string;
    transaction_type: ITransactionType;
    destination_currency?: ICurrency;
    source_currency?: ICurrency;
    createdAt?: Date;
}

// Debit Wallet
export const debitWallet = async ({ data }: { data: IWalletDebit; session: any }) => {
    try {
        const {
            userId,
            amount,
            source_amount,
            destination_amount,
            transactionHash,
            reference,
            description,
            currency,
            exchange_rate_value,
            exchange_rate_currency,
            ip_address,
            note,
            transaction_type,
            destination_currency,
            source_currency,
            createdAt,
        } = data;

        // Check if Wallet exist
        const wallet = await walletRepository.getOne({
            id: userId
        });
        if (!wallet) {
            return {
                success: false,
                message: `Wallet does not exist`,
            };
        }

        if (Number(wallet.balance < amount)) {
            return {
                success: false,
                message: `Insufficient wallet funds`,
            };
        }
        const updateBalance = await walletRepository.processWalletDebitUpdates({
            userId,
            amount: amount,
            balance: wallet?.balance,
        });

        // Save Transaction Ref
        const transactionRef = await transactionRefRepository.create({
            amount,
            transactionHash,
            userId,
        });

        // Save Transaction
        const transaction = await transactionRepository.create({
            amount: amount,
            transaction_hash,
            transaction_medium: ITransactionMedium.WALLET,
            keble_transaction_type: IKebleTransactionType.WALLET_DEBIT,
            user_id: new Types.ObjectId(user_id),
            transaction_ref: transactionRef[0]._id,
            payment_reference: reference,
            transaction_type:
                transaction_type && transaction_type === ITransactionType.WITHDRAWAL
                    ? ITransactionType.WITHDRAWAL
                    : ITransactionType.DEBIT,
            payment_gateway,
            wallet: {
                wallet_id: wallet._id,
                wallet_balance_before: wallet.balance,
                wallet_balance_after: Number(wallet.balance) - Number(amount),
            },
            description: description || "No description",
            currency,
            note: note || null,
            exchange_rate_value: exchange_rate_value || 0,
            exchange_rate_currency: exchange_rate_currency ? exchange_rate_currency : "USD",
            ip_address: ip_address ? ip_address : "",
            transaction_status:
                transaction_type && transaction_type !== ITransactionType.WITHDRAWAL
                    ? ITransactionStatus.SUCCESSFUL
                    : ITransactionStatus.PENDING,
            meta_data: data ? data.data : null,
            transaction_to: transaction_to,
            wallet_transaction_type: wallet_transaction_type,
            destination_currency,
            source_currency,
            source_amount,
            destination_amount,
            createdAt: createdAt && createdAt,
        });

        return {
            success: true,
            message: `Wallet debited successfully`,
            data: { updateBalance, transactionRef, transaction },
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.message,
        };
    }
};