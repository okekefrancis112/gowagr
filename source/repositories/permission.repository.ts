import { IPermissionDocument } from '../interfaces/permission.interface';
import { db } from "../util/prisma";

class PermissionRepository {
  // Function to create new permission
  public async create({
    permission_name,
    permission_description,
    permission_alias,
    hierarchy,
  }: {
    permission_name: string;
    permission_description?: string;
    permission_alias?: string;
    hierarchy?: number;
  }): Promise<IPermissionDocument> {
    const permission = {
      permission_name,
      permission_description,
      permission_alias,
      hierarchy,
    };

    return await db.permission.create({ data: permission }) as any;
  }

  // Function to get a permission
  public async getOne(query:any): Promise<IPermissionDocument | null> {
    return db.permission.findUnique(query) as any;
  }

  // Function to get permissions given the query object provided
  public async get(query: any): Promise<IPermissionDocument | null | any> {
    return await db.permission.findMany(query) as any;
  }
}

// Export PermissionRepository
export default new PermissionRepository();
