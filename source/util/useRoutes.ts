import { Express } from "express";

// User Routes
import user from "../routes/user/user.route";
import profile from "../routes/user/profile.route";
import payment from "../routes/user/payment.route";
import transaction from "../routes/user/transaction.route";


export const bindUserRoutes = (app: Express): void => {
    app.use("/api/v1/user", user);
    app.use("/api/v1/profile", profile);
    app.use("/api/v1/payment", payment);
    app.use("/api/v1/transaction", transaction);
};


