import { Express } from "express";

// User Routes
import user from "../routes/user/user.route";
import profile from "../routes/user/profile.route";
import post from "../routes/user/post.route";
import comment from "../routes/user/comment.route";
import payment from "../routes/user/payment.route";
import transaction from "../routes/user/transaction.route";

// Admin Routes
import authAdmin from "../routes/admin/adminUser.route";
import role from "../routes/admin/role.route";
import tag from "../routes/admin/tag.route";


export const bindUserRoutes = (app: Express): void => {
    app.use("/api/v1/user", user);
    app.use("/api/v1/profile", profile);
    app.use("/api/v1/post", post);
    app.use("/api/v1/comment", comment);
    app.use("/api/v1/payment", payment);
    app.use("/api/v1/transaction", transaction);
};

export const bindAdminRoutes = (app: Express): void => {
    app.use("/api/v1/admin/auth", authAdmin);
    app.use("/api/v1/admin/role", role);
    app.use("/api/v1/admin/tag", tag);
    // app.use("/api/v1/admin/user", users);
};


