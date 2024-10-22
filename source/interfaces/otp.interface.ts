// Create an interface to represent OTP data structure
export interface IOtp {
  id: any;
  // Field for User ID
  userId?: number;
  // Field for Admin ID
  admin_id?: number;
  // Field for OTP value
  otp: number;
  // Field for Token
  token?: string;
  // Field for Expiry Date
  expires_in: Date;
}

// Create an interface which combines Document and IOtp interface
export interface IOtpDocument extends IOtp {}
