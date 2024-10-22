import { IOtpDocument } from '../interfaces/otp.interface';
import { db } from "../util/prisma";

class OtpRepository {

  // Function to create new OTP
  public async create({
    userId,
    admin_id,
    otp,
    token,
    expires_in,
  }: {
    admin_id?: string;
    userId?: string;
    token?: any;
    otp: number;
    expires_in: Date;
}): Promise<IOtpDocument> {
    let res;

    if (userId) {
        res = await db.otp.create({
            data:{
                userId,
                token,
                otp,
                expires_in,
              },
        })
    }

    if (admin_id) {
        res = await db.otp.create({
            data:{
                admin_id,
                otp,
                expires_in,
              },
        })
    }

    return res as any;
  }

  // Function to get OTP (User)
  public async getOne(query:any): Promise<IOtpDocument | null> {
    console.log(query);
    const res:any = db.otp.findFirst({
      where: {...query}
    });
    return res;
  }

  // Function to update OTP (User)
  public async atomicUpdate(
    query: any,
    record: any,
): Promise<IOtpDocument | null> {
    return await db.user.update(
        {
            where: query,
            data: record,
        }
    ) as any;
}

  // Function to verify OTP (User)
  public async verifyOtp({ otp, userId }: { otp: number; userId: string }): Promise<any> {
    try {
      const getOtp = await this.getOne( { userId: userId } );

      if (getOtp?.otp == otp && Number(getOtp?.expires_in) > Date.now()) {
        return { status: true, token: getOtp?.token };
      }

      if (getOtp?.otp !== otp || getOtp?.expires_in! < new Date()) {
        return { status: false, message: 'This OTP is invalid or expired. Try again' };
      }

      return { status: false };
    } catch (err: Error | unknown | any) {
      return { status: false, message: err.message };
    }
  }

  // Function to verify OTP (Admin)
  public async verifyAdminOtp({
    otp,
    admin_id,
  }: {
    otp: number;
    admin_id: string;
  }): Promise<any> {
    try {
      const getOtp = await this.getOne({ admin_id: admin_id });

      if (getOtp?.otp == otp && Number(getOtp?.expires_in) > Date.now()) {
        return { status: true };
      }

      if (getOtp?.otp !== otp || getOtp?.expires_in! < new Date()) {
        return {
          status: false,
          message: 'Your OTP is invalid or has timed out. Please generate a new one and try again.',
        };
      }

      return { status: false };
    } catch (err: Error | unknown | any) {
      return { status: false, message: err.message };
    }
  }

}

// Export OtpRepository
export default new OtpRepository();
