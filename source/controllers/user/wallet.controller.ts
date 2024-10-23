import { Response } from 'express';
import { ExpressRequest } from '../../server';
import UtilFunctions, { link, throwIfUndefined } from '../../util';
import ResponseHandler from '../../util/response-handler';
import { APP_CONSTANTS, HTTP_CODES } from '../../constants/app_defaults.constant';
import notificationRepository from '../../repositories/notification.repository';
import { INotificationCategory, INotificationStatus } from '../../interfaces/notification.interface';
import userRepository from '../../repositories/user.repository';
import walletRepository from '../../repositories/wallet.repository';
import { WALLET_STATUS } from '../../interfaces/wallet.interface';
import { Types } from 'aws-sdk/clients/acm';
import { env } from 'process';
import otpRepository from '../../repositories/otp.repository';
import { NotificationTaskJob } from '../../services/queues/producer.service';

/****
 *
 *
 * Fetch Single Notification
 */
export async function fundWallet(
  req: ExpressRequest,
  res: Response
): Promise<Response | void> {
  try {
      const userObject = throwIfUndefined(req.user, "req.user");
      const id = userObject.id;
      const amount = Math.trunc(parseFloat(req.body.amount) * 10) / 10;

      if (Math.sign(amount) === -1) {
          return ResponseHandler.sendErrorResponse({
              res,
              code: HTTP_CODES.BAD_REQUEST,
              error: "Please input a positive amount",
          });
      }

      const user: any = await userRepository.getOne({
        where: { id: id },
      });

      if (!user) {
          return ResponseHandler.sendErrorResponse({
              res,
              code: HTTP_CODES.NOT_FOUND,
              error: "User not found. Please check your input.",
          });
      }

      const wallet = await walletRepository.getOne({
        where: { id: id },
      });

      if (!wallet) {
          return ResponseHandler.sendErrorResponse({
              res,
              code: HTTP_CODES.NOT_FOUND,
              error: "Sorry, this wallet does not exist.",
          });
      }

      if (wallet.status === WALLET_STATUS.INACTIVE) {
          return ResponseHandler.sendErrorResponse({
              res,
              code: HTTP_CODES.BAD_REQUEST,
              error: "Wallet is inactive",
          });
      }


      let check_amount: number = 0;

  } catch (error) {
      return ResponseHandler.sendErrorResponse({
          res,
          code: HTTP_CODES.INTERNAL_SERVER_ERROR,
          error: `${error}`,
      });
  }
}

export async function walletTransfer(
  req: ExpressRequest,
  res: Response
): Promise<Response | void> {
  try {
      const user = throwIfUndefined(req.user, "req.user");

      const senderUser = await userRepository.getOne({
        where: { id: user.id },
        });

      if (!senderUser) {
          return ResponseHandler.sendErrorResponse({
              res,
              code: HTTP_CODES.NOT_FOUND,
              error: `Sorry, the sender's identity could not be verified.`,
          });
      }

      const { recipientAccountNumber, amount, note } = req.body;

      // Get Sender Wallet
      const sender_wallet = await walletRepository.getOne({
          userId: senderUser.id,
      });

      if (!sender_wallet) {
          return ResponseHandler.sendErrorResponse({
              res,
              code: HTTP_CODES.NOT_FOUND,
              error: `Sender's wallet not found, please try again.`,
          });
      }

      // Validate if the amount is a positive number
      if (Number(amount) <= 0) {
          return ResponseHandler.sendErrorResponse({
              res,
              code: HTTP_CODES.BAD_REQUEST,
              error: "Invalid amount. Amount must be greater than zero.",
          });
      }

      // Check if the amount is greater than the user's balance
      if (sender_wallet.balance < Number(amount)) {
          return ResponseHandler.sendErrorResponse({
              res,
              code: HTTP_CODES.BAD_REQUEST,
              error: `Sorry, insufficient funds.`,
          });
      }

      // Get Recipients Wallet
      const wallet = await walletRepository.getOne({
        walletAccountNumber: recipientAccountNumber,
      });

      if (!wallet) {
          return ResponseHandler.sendErrorResponse({
              res,
              code: HTTP_CODES.NOT_FOUND,
              error: `Sorry, no user was found with account number: ${recipientAccountNumber}.`,
          });
      }

      if (wallet.status !== WALLET_STATUS.ACTIVE) {
          return ResponseHandler.sendErrorResponse({
              res,
              code: HTTP_CODES.UNAUTHORIZED,
              error: `Sorry, transaction could not be completed due to recipient's blocked wallet.`,
          });
      }

      if (sender_wallet.walletAccountNumber === recipientAccountNumber) {
          return ResponseHandler.sendErrorResponse({
              res,
              code: HTTP_CODES.BAD_REQUEST,
              error: `Sorry, you cannot transfer to the same wallet.`,
          });
      }

      const token: any = await UtilFunctions.generateToken({
          id: user.id,
          fullname: user.fullname,
          email: user.email,
          token_type: APP_CONSTANTS.TOKEN_TYPE.TRANSFER,
          recipientAccountNumber,
          amount,
          note,
      });

      // Save OTP
      const otp = await UtilFunctions.generateOtp({
          userId: user.id,
          token,
      });

      await UtilFunctions.sendEmail2("wallet/transfer-money-otp.hbs", {
          to: user?.email,
          subject: "Wallet Transfer OTP",
          props: {
              otp: otp?.otp,
              name: user.fullname,
          },
      });

      return ResponseHandler.sendSuccessResponse({
          res,
          code: HTTP_CODES.CREATED,
          message: "OTP sent",
      });
  } catch (error) {
      return ResponseHandler.sendErrorResponse({
          res,
          code: HTTP_CODES.INTERNAL_SERVER_ERROR,
          error: `${error}`,
      });
  }
}

export async function verifyWalletTransfer(
  req: ExpressRequest,
  res: Response
): Promise<Response | void> {
  try {
      const user = throwIfUndefined(req.user, "req.user");

      const { otp } = req.body;

      const otpObject = await otpRepository.verifyOtp({
          userId: user.id,
          otp,
      });

      if (!otpObject.status) {
          return ResponseHandler.sendErrorResponse({
              res,
              code: HTTP_CODES.BAD_REQUEST,
              error: otpObject.message,
          });
      }

      if (otpObject.token === "undefined") {
          return ResponseHandler.sendErrorResponse({
              res,
              code: HTTP_CODES.BAD_REQUEST,
              error: "OTP used already",
          });
      }

      const verify_token: any = await UtilFunctions.verifyToken(
          otpObject.token
      );

      if (
          verify_token.decoded.token_type !==
          APP_CONSTANTS.TOKEN_TYPE.TRANSFER
      ) {
          return ResponseHandler.sendErrorResponse({
              res,
              code: HTTP_CODES.BAD_REQUEST,
              error: `This OTP is not for wallet transfer, its for ${verify_token.decoded.token_type}, please use the correct OTP`,
          });
      }

      const { recipientAccountNumber, amount, note } = verify_token.decoded;

      // Get Recipients Wallet
      const wallet = await walletRepository.getOne({
        where: { wallet_account_number: recipientAccountNumber },
      });

      if (!wallet) {
          return ResponseHandler.sendErrorResponse({
              res,
              code: HTTP_CODES.NOT_FOUND,
              error: `Sorry, no user was found with this account number: ${recipientAccountNumber}`,
          });
      }

      if (wallet.status !== WALLET_STATUS.ACTIVE) {
          return ResponseHandler.sendErrorResponse({
              res,
              code: HTTP_CODES.UNAUTHORIZED,
              error: `Transaction failed. Recipient's wallet is blocked.`,
          });
      }

      const senderUser = await userRepository.getOne({
        where: { id: user.id },
        });

      if (!senderUser) {
          return ResponseHandler.sendErrorResponse({
              res,
              code: HTTP_CODES.NOT_FOUND,
              error: `Sender could not be verified`,
          });
      }

      // Get Sender Wallet

      const sender_wallet = await walletRepository.getOne({
          where: {userId: senderUser.id},
      });

      if (!sender_wallet) {
          return ResponseHandler.sendErrorResponse({
              res,
              code: HTTP_CODES.NOT_FOUND,
              error: `Sender's wallet not found`,
          });
      }

      if (sender_wallet.walletAccountNumber == recipientAccountNumber) {
          return ResponseHandler.sendErrorResponse({
              res,
              code: HTTP_CODES.BAD_REQUEST,
              error: `Sorry, cannot transfer to same wallet.`,
          });
      }

      const reference = UtilFunctions.generateTXRef();
      const transaction_hash = UtilFunctions.generateTXHash();

      // get reciever
      const receiverWallet = await walletRepository.getOne({
        where: {walletAccountNumber: recipientAccountNumber},
      });

      if (!receiverWallet) {
          return ResponseHandler.sendErrorResponse({
              res,
              code: HTTP_CODES.NOT_FOUND,
              error: `Receiver's wallet not found`,
          });
      }

      const receiver_id = receiverWallet?.userId;
      const receiverUser = await userRepository.getOne({
         where:  {id: receiver_id},
      });

      if (!receiverUser) {
          return ResponseHandler.sendErrorResponse({
              res,
              code: HTTP_CODES.NOT_FOUND,
              error: `Receiver could not be verified`,
          });
      }

      const debitPayload = {
          amount: amount,
          user_id: new Types.ObjectId(sender_wallet?.user_id),
          sender: new Types.ObjectId(sender_wallet?.user_id),
          recipient: wallet?.userId,
          currency: IC,
          note: note,
          payment_gateway: IPaymentGateway.WALLET,
          reference,
          transaction_hash,
          transaction_to: ITransactionTo.WALLET,
          transaction_type: ITransactionType.DEBIT,
          wallet_transaction_type: IWalletTransactionType.SEND_TO_FRIEND,
          description: `Transfer to ${receiverUser.first_name} ${receiverUser.last_name}`,
      };

      const creditPayload = {
          amount: amount,
          user_id: new Types.ObjectId(wallet?.user_id),
          sender: sender_wallet?.user_id,
          recipient: wallet?.user_id,
          currency: ICurrency.USD,
          payment_gateway: IPaymentGateway.WALLET,
          note: note,
          reference,
          transaction_hash,
          transaction_to: ITransactionTo.WALLET,
          wallet_transaction_type: IWalletTransactionType.RECEIVE_FROM_FRIEND,
          description: `Transfer from ${senderUser.first_name} ${senderUser.last_name}`,
      };

      const result = await Promise.all([
          debitWallet({ data: debitPayload, session }),
          creditWallet({ data: creditPayload, session }),
      ]);

      const failedTxns = result.filter((r:any) => r.success !== true);

      if (failedTxns.length) {
          const errors = failedTxns.map((a:any) => a.message);

          return ResponseHandler.sendErrorResponse({
              res,
              code: HTTP_CODES.BAD_REQUEST,
              error: errors,
          });
      }

      await otpRepository.atomicUpdate(
        {id: user.id},
        {
          token: 'undefined'
        }
      );

      const balance_before = sender_wallet.balance;
      const balance = balance_before - Number(amount);
      await UtilFunctions.sendEmail2("wallet/transfer-to-keble-user.hbs", {
          to: user?.email,
          subject: "Transfer Sent",
          props: {
              name: `${user.fullname}`,
              receiver: `${receiverUser.fullname}`,
              amount: amount,
              balance_before: balance_before,
              balance: balance,
          },
      });

      const receiver_balance_before = wallet.balance;
      const receiver_balance = receiver_balance_before + Number(amount);
      await UtilFunctions.sendEmail2("wallet/income-from-keble-user.hbs", {
          to: receiverUser?.email,
          subject: "Transfer Received",
          props: {
              name: `${receiverUser.fullname}`,
              sender: `${senderUser.fullname}`,
              amount: amount,
              receiver_balance_before: receiver_balance_before,
              receiver_balance: receiver_balance,
          },
      });


      return ResponseHandler.sendSuccessResponse({
          res,
          code: HTTP_CODES.OK,
          message: "Wallet Transfer successful",
      });
  } catch (error) {
      return ResponseHandler.sendErrorResponse({
          res,
          code: HTTP_CODES.INTERNAL_SERVER_ERROR,
          error: `${error}`,
      });
  }
}

export async function getUserWallet(
  req: ExpressRequest,
  res: Response
): Promise<Response | void> {
  try {
      const user = throwIfUndefined(req.user, "req.user");

      const wallet = await walletRepository.getOne({
        where: {userId: user.id}
      });

      if (!wallet) {
          return ResponseHandler.sendErrorResponse({
              res,
              code: HTTP_CODES.NOT_FOUND,
              error: `Sorry, this wallet does not exist.`,
          });
      }

      const getUser = await userRepository.getOne({
          where: { id: user.id },
          select:{
            id: true,
            email: true,
            fullname: true,
          }
      });

      if (!getUser) {
          return ResponseHandler.sendErrorResponse({
              res,
              code: HTTP_CODES.NOT_FOUND,
              error: "Wallet user does not exist",
          });
      }

      const transactions = await transactionRepository.findPaginatedWalletTransactions(
        req,
        getUser.id
      );

      return ResponseHandler.sendSuccessResponse({
          res,
          code: HTTP_CODES.OK,
          message: "User wallet details fetched",
          data: {
              transactions,
              userInfo: {
                  name: `${getUser?.fullname}`,
                  image: getUser?.image ? getUser?.image : "",
              },
              balance: wallet.balance,
              walletId: wallet.walletAccountNumber,
          },
      });
  } catch (error) {
      return ResponseHandler.sendErrorResponse({
          res,
          code: HTTP_CODES.INTERNAL_SERVER_ERROR,
          error: `${error}`,
      });
  }
}

