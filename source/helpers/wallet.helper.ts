import { Types } from "aws-sdk/clients/acm";
import { IAction } from "../interfaces/webhook.interface";
import transactionRepository from "../repositories/transaction.repository";
import userRepository from "../repositories/user.repository";
import walletRepository from "../repositories/wallet.repository";

interface IWalletCredit {
    userId: String;
    amount: number;
    currency?: string;
    userCurrency?: string;
    senderId?: string;
    receiverId?: string;
    paymentId?: string;
    remarks?: string;
    isPaid?: boolean;
    name?: string;
    isActive?: boolean;
    user?: string;
}

// Credit Wallet
export const creditWallet = async ({ data, session }: { data: IWalletCredit; session: any }) => {
    try {
        const {
            userId,
            amount,
            currency,
            userCurrency,
            senderId,
            receiverId,
            paymentId,
            remarks,
            isPaid,
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
            session,
        });

        // Save Transaction Ref
        const transactionRef = await transaction_refRepository.create({
            amount,
            transaction_hash,
            user_id,
            session,
        });

        // Save Transaction
        const transaction = await transactionRepository.create({
            amount,
            source_amount,
            destination_amount,
            source_currency,
            destination_currency,
            transaction_hash,
            transaction_medium: ITransactionMedium.WALLET,
            keble_transaction_type: IKebleTransactionType.WALLET_FUNDING,
            user_id: new Types.ObjectId(user_id),
            transaction_ref: transactionRef[0]._id,
            wallet: {
                wallet_id: wallet._id,
                wallet_balance_before: wallet.balance,
                wallet_balance_after:
                    payment_gateway && payment_gateway !== IPaymentGateway.DIASPORA_TRANSFER
                        ? Number(wallet.balance) + Number(amount)
                        : Number(wallet.balance),
                // Number(wallet.balance) + Number(amount),
            },
            payment_reference: reference,
            transaction_type: ITransactionType.CREDIT,
            payment_gateway,
            description,
            sender,
            recipient,
            note,
            currency,
            exchange_rate_value,
            exchange_rate_currency,
            ip_address,
            transaction_status:
                payment_gateway && payment_gateway !== IPaymentGateway.DIASPORA_TRANSFER
                    ? ITransactionStatus.SUCCESSFUL
                    : ITransactionStatus.PENDING,
            meta_data: data ? data.data : null,
            session,
            transaction_to,
            wallet_transaction_type,
            charge: charge || 0,
        });

        // Save Webhook
        const webhook = await webhookRepository.create({
            platform: payment_gateway,
            action: IAction.WEBHOOK_SAVED,
            webhook_id: String(webhook_id),
            data,
            session,
        });

        const update_user = await userRepository.atomicUpdate(
            { _id: user_id },
            { total_amount_funded: amount },
            session
        );

        const savingsTracker = await SavingsTrackerHelper({
            user_id: String(user_id),
            amount: amount,
            is_debit: false,
            credits_array: {
                amount: amount,
                date: new Date(),
                transaction_id: new Types.ObjectId(transaction._id),
            },
            all_transactions: {
                amount: amount,
                date: new Date(),
                transaction_id: new Types.ObjectId(transaction._id),
                is_debit: false,
            },
            session,
        });

        return {
            success: true,
            message: `Wallet credited successfully`,
            data: {
                updateBalance,
                transactionRef,
                transaction,
                webhook,
                update_user,
                savingsTracker,
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
    user_id: Types.ObjectId;
    amount: number;
    source_amount?: number;
    destination_amount?: number;
    transaction_hash: string;
    reference: string;
    data?: any;
    payment_gateway: IPaymentGateway;
    description?: string;
    currency: ICurrency;
    exchange_rate_value?: number;
    exchange_rate_currency?: string;
    ip_address?: string;
    note?: string;
    transaction_to: ITransactionTo;
    transaction_type: ITransactionType;
    wallet_transaction_type: IWalletTransactionType;
    destination_currency?: ICurrency;
    source_currency?: ICurrency;
    createdAt?: Date;
}

// Debit Wallet
export const debitWallet = async ({ data, session }: { data: IWalletDebit; session: any }) => {
    try {
        const {
            user_id,
            amount,
            source_amount,
            destination_amount,
            transaction_hash,
            reference,
            payment_gateway,
            description,
            currency,
            exchange_rate_value,
            exchange_rate_currency,
            ip_address,
            note,
            transaction_to,
            transaction_type,
            wallet_transaction_type,
            destination_currency,
            source_currency,
            createdAt,
        } = data;

        // Check if Wallet exist
        const wallet = await walletRepository.getByUserId({ user_id });
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
            user_id,
            amount: amount,
            balance: wallet?.balance,
            session,
        });

        // Save Transaction Ref
        const transactionRef = await transaction_refRepository.create({
            amount,
            transaction_hash,
            user_id,
            session,
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
            session,
        });

        await SavingsTrackerHelper({
            user_id: String(user_id),
            amount: -amount,
            is_debit: true,
            is_debit_category: transaction_to,
            last_debit_date: new Date(),
            all_transactions: {
                amount: amount,
                date: new Date(),
                transaction_id: new Types.ObjectId(transaction._id),
                is_debit_category: transaction_to,
                is_debit: true,
            },
            session,
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