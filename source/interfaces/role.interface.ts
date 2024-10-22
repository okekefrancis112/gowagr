// import { Types, Document } from "prisma";

export interface IRole {
    id: string;
    role_name: string;
    role_description?: string;
    permissions: Array<string>;
    status?: boolean;
    hierarchy: number;
}

export interface IRoleDocument extends Document, IRole {}
