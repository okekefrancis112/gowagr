// import { Document } from "prisma";
export interface IPermission {
    id: string;
    permission_name: string;
    permission_description?: string;
    permission_alias?: string;
    hierarchy?: number;
}

export interface IPermissionDocument extends Document, IPermission {}
