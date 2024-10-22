import { IRoleDocument } from '../interfaces/role.interface';
import { db } from "../util/prisma";

class RoleRepository {
  // Create Admin Roles
  public async create({
    role_name,
    role_description,
    permissions,
    status = true,
    hierarchy = 3,
  }: {
    role_name: string;
    role_description?: string;
    permissions?: any;
    status?: boolean;
    hierarchy?: number;
  }): Promise<IRoleDocument> {
    const role = {
      role_name,
      role_description,
      permissions,
      status,
      hierarchy,
    };

    return await db.adminRole.create({ data: role })  as any;
  }

  // Get role by role name
  public async getOne(
    query: any
  ): Promise<IRoleDocument | null> {
    console.log("getOne", query);
      return db.adminRole.findUnique(query) as any;
  }

  // Function to get a user document by email
    // @param {Object} - An object containing the email and an optional leanVersion boolean
    // @returns {Promise<IUserDocument | null>} - A promise that resolves with a user document or null if not found
    public async get(query:any): Promise<IRoleDocument | null> {
      // Query the User model for a document with the given email
      return db.adminRole.findMany(query) as any;
  }

  // Update role by id
  public async atomicUpdate(
    query: any,
    record: any,
    ): Promise<IRoleDocument | null> {
    return await db.adminRole.update(
      {
          where: query,
          data: record,
      }
  ) as any;
  }

  // Delete role by query
  public async delete(query: any): Promise<IRoleDocument | null> {
    return await db.adminRole.delete(
      {
          where: query,
      }
  ) as any;
  }

  // // Delete all roles
  // public async getAll(req: ExpressRequest): Promise<IRoleDocument[] | null | any> {
  //   const { query } = req; // Get the query params from the request object
  //   const search = String(query.search) || ''; // Set the string for searching
  //   const perpage = Number(query.perpage) || 10; // Set the number of records to return
  //   const page = Number(query.page) || 1; // Set the page number

  //   let filterQuery = {}; // Initialize the filter query object

  //   // Check if search query is present and has valid length
  //   if (search !== 'undefined' && Object.keys(search).length > 0) {
  //     filterQuery = {
  //       $or: [
  //         { role_name: new RegExp(search, 'i') },
  //         { role_description: new RegExp(search, 'i') },
  //       ],
  //     };
  //   }

  //   // Get admin roles from the database
  //   const roles = await Role.find(filterQuery)
  //     .populate({
  //       path: 'permissions',
  //       select: 'permission_name',
  //     })
  //     .limit(perpage)
  //     .skip(page * perpage - perpage);

  //   const total = await this.countDocs(filterQuery);
  //   const pagination = repoPagination({ page, perpage, total: total! });

  //   return {
  //     data: roles,
  //     pagination,
  //   };
  // }

  // public async countDocs(query: FilterQuery<IRoleDocument>): Promise<IRoleDocument | null | any> {
  //   return Role.countDocuments({ ...query });
  // }

}

// Export RoleRepository
export default new RoleRepository();
